import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Users, Droplets, Building2, FileText, Calendar } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import type { Donor, Hospital } from '../../types';

export function AdminReports() {
  const { requests, donations, donors, hospitals, campaigns } = useDataStore();
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Filter out cancelled items for reporting
  const activeRequests = requests.filter(r => r.status !== 'cancelled');
  const activeCampaigns = campaigns.filter(c => c.status !== 'cancelled');

  const completedDonations = donations.filter((d) => d.status === 'completed');
  const totalUnits = completedDonations.reduce((sum, d) => sum + d.units, 0);
  const totalPoints = donors.reduce((sum, d) => sum + (d.points || 0), 0);
  const fulfilledRequests = activeRequests.filter((r) => r.status === 'fulfilled');
  const activeHospitals = hospitals.filter((h) => h.status === 'active');

  const bloodGroupStats = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => ({
    bloodGroup: bg,
    donors: donors.filter((d: Donor) => d.bloodGroup === bg).length,
    donations: completedDonations.filter((d) => d.bloodGroup === bg).length,
    requests: activeRequests.filter((r) => r.bloodGroup === bg).length,
  }));

  const monthlyData = [
    { month: 'Jan', donations: 45, requests: 38 },
    { month: 'Feb', donations: 52, requests: 42 },
    { month: 'Mar', donations: 48, requests: 45 },
    { month: 'Apr', donations: 61, requests: 55 },
    { month: 'May', donations: 55, requests: 48 },
    { month: 'Jun', donations: 67, requests: 58 },
  ];

  // Generate report data based on selected months
  const generateReportData = (months: number) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    // Filter data by date range
    const filteredDonations = donations.filter(d => new Date(d.createdAt) >= startDate);
    const filteredRequests = activeRequests.filter(r => new Date(r.createdAt) >= startDate);
    const filteredCampaigns = activeCampaigns.filter(c => new Date(c.createdAt) >= startDate);
    
    const completedInPeriod = filteredDonations.filter(d => d.status === 'completed');
    const unitsInPeriod = completedInPeriod.reduce((sum, d) => sum + d.units, 0);
    const pointsInPeriod = completedInPeriod.reduce((sum, d) => sum + d.pointsEarned, 0);
    
    return {
      period: {
        start: startDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        end: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        months: months
      },
      summary: {
        totalDonors: donors.length,
        activeDonors: donors.filter((d: Donor) => d.isAvailable).length,
        totalHospitals: hospitals.length,
        activeHospitals: activeHospitals.length,
        totalRequests: filteredRequests.length,
        pendingRequests: filteredRequests.filter(r => r.status === 'pending').length,
        fulfilledRequests: filteredRequests.filter(r => r.status === 'fulfilled').length,
        totalDonations: filteredDonations.length,
        completedDonations: completedInPeriod.length,
        unitsCollected: unitsInPeriod,
        pointsDistributed: pointsInPeriod,
        totalCampaigns: filteredCampaigns.length,
        upcomingCampaigns: filteredCampaigns.filter(c => c.status === 'upcoming').length,
      },
      bloodGroupBreakdown: bloodGroupStats,
      topDonors: donors
        .sort((a: Donor, b: Donor) => (b.points || 0) - (a.points || 0))
        .slice(0, 10)
        .map((d: Donor) => ({
          name: d.name,
          email: d.email,
          bloodGroup: d.bloodGroup,
          donations: d.totalDonations || 0,
          points: d.points || 0,
          level: d.level || 1
        })),
      topHospitals: hospitals
        .filter((h: Hospital) => h.status === 'active')
        .slice(0, 10)
        .map((h: Hospital) => ({
          name: h.hospitalName,
          city: h.location.city,
          state: h.location.state,
          status: h.status
        })),
      requestsByPriority: {
        emergency: filteredRequests.filter(r => r.priority === 'emergency').length,
        urgent: filteredRequests.filter(r => r.priority === 'urgent').length,
        normal: filteredRequests.filter(r => r.priority === 'normal').length,
      },
      generatedAt: now.toISOString(),
      generatedBy: 'HemaLink Admin System'
    };
  };

  const handleExportReport = async () => {
    setIsGenerating(true);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const months = parseInt(selectedMonths);
    const reportData = generateReportData(months);
    
    // Create report content
    const reportContent = `
================================================================================
                         HEMALINK BLOOD DONATION SYSTEM
                              ADMINISTRATIVE REPORT
================================================================================

REPORT PERIOD
-------------
From: ${reportData.period.start}
To: ${reportData.period.end}
Duration: ${reportData.period.months} Month(s)
Generated: ${new Date(reportData.generatedAt).toLocaleString('en-IN')}

================================================================================
                              EXECUTIVE SUMMARY
================================================================================

DONOR STATISTICS
----------------
Total Registered Donors: ${reportData.summary.totalDonors}
Currently Available Donors: ${reportData.summary.activeDonors}

HOSPITAL STATISTICS
-------------------
Total Registered Hospitals: ${reportData.summary.totalHospitals}
Active Hospitals: ${reportData.summary.activeHospitals}

BLOOD REQUEST STATISTICS
------------------------
Total Requests: ${reportData.summary.totalRequests}
Pending Requests: ${reportData.summary.pendingRequests}
Fulfilled Requests: ${reportData.summary.fulfilledRequests}
Fulfillment Rate: ${reportData.summary.totalRequests > 0 ? Math.round((reportData.summary.fulfilledRequests / reportData.summary.totalRequests) * 100) : 0}%

DONATION STATISTICS
-------------------
Total Donations: ${reportData.summary.totalDonations}
Completed Donations: ${reportData.summary.completedDonations}
Units Collected: ${reportData.summary.unitsCollected}
Points Distributed: ${reportData.summary.pointsDistributed}

CAMPAIGN STATISTICS
-------------------
Total Campaigns: ${reportData.summary.totalCampaigns}
Upcoming Campaigns: ${reportData.summary.upcomingCampaigns}

================================================================================
                          BLOOD GROUP BREAKDOWN
================================================================================

Blood Group | Donors | Donations | Requests
------------|--------|-----------|----------
${reportData.bloodGroupBreakdown.map(bg => 
  `${bg.bloodGroup.padEnd(11)} | ${String(bg.donors).padEnd(6)} | ${String(bg.donations).padEnd(9)} | ${bg.requests}`
).join('\n')}

================================================================================
                          REQUESTS BY PRIORITY
================================================================================

Emergency: ${reportData.requestsByPriority.emergency}
Urgent: ${reportData.requestsByPriority.urgent}
Normal: ${reportData.requestsByPriority.normal}

================================================================================
                              TOP DONORS
================================================================================

Rank | Name                      | Blood | Donations | Points | Level
-----|---------------------------|-------|-----------|--------|------
${reportData.topDonors.map((d: any, i: number) => 
  `${String(i + 1).padEnd(4)} | ${d.name.substring(0, 25).padEnd(25)} | ${d.bloodGroup.padEnd(5)} | ${String(d.donations).padEnd(9)} | ${String(d.points).padEnd(6)} | ${d.level}`
).join('\n') || 'No donors registered yet'}

================================================================================
                            ACTIVE HOSPITALS
================================================================================

${reportData.topHospitals.map((h: any, i: number) => 
  `${i + 1}. ${h.name}
   Location: ${h.city}, ${h.state}
   Status: ${h.status}
`).join('\n') || 'No active hospitals yet'}

================================================================================
                              END OF REPORT
================================================================================

This report was automatically generated by HemaLink Blood Donation System.
For any queries, contact: support@hemalink.com

© 2026 HemaLink. All rights reserved.
`;

    // Create and download the file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HemaLink_Report_${months}Months_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
    setReportGenerated(true);
  };

  const resetExportModal = () => {
    setIsExportModalOpen(false);
    setReportGenerated(false);
    setSelectedMonths('1');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-600">Platform performance and statistics</p>
        </div>
        <Button onClick={() => setIsExportModalOpen(true)}>
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Droplets className="w-6 h-6" />, value: totalUnits, label: 'Units Collected', color: 'bg-rose-100 text-rose-600' },
          { icon: <Users className="w-6 h-6" />, value: donors.length, label: 'Total Donors', color: 'bg-blue-100 text-blue-600' },
          { icon: <Building2 className="w-6 h-6" />, value: activeHospitals.length, label: 'Active Hospitals', color: 'bg-emerald-100 text-emerald-600' },
          { icon: <TrendingUp className="w-6 h-6" />, value: `${Math.round((fulfilledRequests.length / (activeRequests.length || 1)) * 100) || 0}%`, label: 'Fulfillment Rate', color: 'bg-purple-100 text-purple-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center gap-4">
                <span className="w-10 text-sm text-slate-500">{data.month}</span>
                <div className="flex-1 flex gap-2">
                  <div
                    className="h-6 bg-rose-500 rounded-r-full flex items-center justify-end pr-2"
                    style={{ width: `${(data.donations / 70) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{data.donations}</span>
                  </div>
                </div>
                <div className="flex-1 flex gap-2">
                  <div
                    className="h-6 bg-blue-500 rounded-r-full flex items-center justify-end pr-2"
                    style={{ width: `${(data.requests / 70) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{data.requests}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-sm text-slate-600">Donations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-slate-600">Requests</span>
            </div>
          </div>
        </Card>

        {/* Blood Group Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Blood Group Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-sm font-medium text-slate-500">Type</th>
                  <th className="text-center py-2 text-sm font-medium text-slate-500">Donors</th>
                  <th className="text-center py-2 text-sm font-medium text-slate-500">Donations</th>
                  <th className="text-center py-2 text-sm font-medium text-slate-500">Requests</th>
                </tr>
              </thead>
              <tbody>
                {bloodGroupStats.map((stat) => (
                  <tr key={stat.bloodGroup} className="border-b border-slate-50">
                    <td className="py-2 font-bold text-rose-600">{stat.bloodGroup}</td>
                    <td className="py-2 text-center text-slate-600">{stat.donors}</td>
                    <td className="py-2 text-center text-slate-600">{stat.donations}</td>
                    <td className="py-2 text-center text-slate-600">{stat.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Campaign Performance</h3>
        {activeCampaigns.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No campaigns to display</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Campaign</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hospital</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Registrations</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Collected</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Target</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{campaign.name}</td>
                    <td className="py-3 px-4 text-slate-600">{campaign.hospitalName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(campaign.startDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{campaign.attendees.length}</td>
                    <td className="py-3 px-4 font-medium text-rose-600">{campaign.collectedUnits}</td>
                    <td className="py-3 px-4 text-slate-600">{campaign.targetUnits}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          campaign.status === 'upcoming' ? 'info' :
                          campaign.status === 'ongoing' ? 'success' : 'default'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Points & Rewards Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Rewards Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-3xl font-bold text-amber-600">{totalPoints}</div>
            <div className="text-sm text-amber-700">Total Points Distributed</div>
          </div>
          <div className="text-center p-4 bg-rose-50 rounded-xl">
            <div className="text-3xl font-bold text-rose-600">{completedDonations.length}</div>
            <div className="text-sm text-rose-700">Verified Donations</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-3xl font-bold text-emerald-600">
              {Math.round(totalPoints / (completedDonations.length || 1))}
            </div>
            <div className="text-sm text-emerald-700">Avg Points per Donation</div>
          </div>
        </div>
      </Card>

      {/* Export Report Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={resetExportModal}
        title="Export Report"
        size="lg"
      >
        {!reportGenerated ? (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Generate Administrative Report</h4>
                  <p className="text-sm text-slate-500">Select the time period for your report</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Report Period
              </label>
              <Select
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(e.target.value)}
                options={[
                  { value: '1', label: 'Last 1 Month' },
                  { value: '3', label: 'Last 3 Months' },
                  { value: '6', label: 'Last 6 Months' },
                  { value: '12', label: 'Last 12 Months (1 Year)' },
                  { value: '24', label: 'Last 24 Months (2 Years)' },
                ]}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h5 className="font-medium text-blue-800 mb-2">Report will include:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Executive summary with key metrics</li>
                <li>• Donor and hospital statistics</li>
                <li>• Blood request and donation data</li>
                <li>• Blood group breakdown</li>
                <li>• Top donors leaderboard</li>
                <li>• Active hospitals list</li>
                <li>• Campaign performance data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetExportModal}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleExportReport}
                isLoading={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" /> Generate & Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Report Downloaded!</h3>
            <p className="text-slate-600 mb-6">
              Your {selectedMonths}-month report has been generated and downloaded successfully.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetExportModal}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                setReportGenerated(false);
              }}>
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
