import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Building2, Phone, Navigation, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { Donor, Hospital } from '../../types';

export function DonateBlood() {
  const { user } = useAuthStore();
  const { hospitals, createDonation, addNotification } = useDataStore();
  const donor = user as Donor;

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isBooked, setIsBooked] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  const activeHospitals = hospitals.filter((h) => h.status === 'active');
  
  // Filter hospitals by city search
  const filteredHospitals = activeHospitals.filter((h) => 
    searchCity === '' || 
    h.location.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    h.hospitalName.toLowerCase().includes(searchCity.toLowerCase()) ||
    h.location.state.toLowerCase().includes(searchCity.toLowerCase())
  );

  // Calculate distance (simplified - in real app would use actual coordinates)
  const getDistance = (hospital: Hospital) => {
    if (hospital.location.lat && hospital.location.lng && donor?.location?.lat && donor?.location?.lng) {
      const R = 6371; // Earth's radius in km
      const dLat = (hospital.location.lat - donor.location.lat) * Math.PI / 180;
      const dLon = (hospital.location.lng - donor.location.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(donor.location.lat * Math.PI / 180) * Math.cos(hospital.location.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return Math.round(R * c);
    }
    return Math.floor(Math.random() * 50) + 5; // Random distance for demo
  };

  // Sort hospitals by distance
  const sortedHospitals = [...filteredHospitals].sort((a, b) => getDistance(a) - getDistance(b));

  const handleBookSession = () => {
    if (!selectedHospital || !bookingDate || !user) return;

    const scheduledDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    createDonation({
      donorId: user.id,
      donorName: user.name,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.hospitalName,
      bloodGroup: donor.bloodGroup,
      units: 1,
      status: 'scheduled',
      scheduledDate: scheduledDateTime,
    });

    addNotification({
      userId: user.id,
      title: 'Donation Scheduled! 📅',
      message: `Your donation at ${selectedHospital.hospitalName} is scheduled for ${new Date(scheduledDateTime).toLocaleDateString('en-IN')} at ${bookingTime}`,
      type: 'donation',
      link: '/donor/donations',
    });

    // Notify hospital
    addNotification({
      userId: selectedHospital.id,
      title: 'New Donation Scheduled',
      message: `${user.name} (${donor.bloodGroup}) has scheduled a donation for ${new Date(scheduledDateTime).toLocaleDateString('en-IN')}`,
      type: 'donation',
      link: '/hospital/donations',
    });

    setIsBooked(true);
  };

  const resetBooking = () => {
    setIsModalOpen(false);
    setSelectedHospital(null);
    setBookingDate('');
    setBookingTime('10:00');
    setIsBooked(false);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800">Donate Blood</h1>
        <p className="text-slate-600">Book a donation session at a hospital near you</p>
      </motion.div>

      {/* Donor Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-rose-600 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">Your Blood Type</p>
              <p className="text-3xl font-bold">{donor?.bloodGroup}</p>
              <p className="text-rose-100 text-sm mt-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                {donor?.location?.city}, {donor?.location?.state}
              </p>
            </div>
            <div className="text-right">
              <p className="text-rose-100 text-sm">Total Donations</p>
              <p className="text-3xl font-bold">{donor?.totalDonations || 0}</p>
              <p className="text-rose-100 text-sm mt-1">Lives Saved: {(donor?.totalDonations || 0) * 3}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          placeholder="Search by city, state or hospital name..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          icon={<MapPin className="w-5 h-5" />}
        />
      </motion.div>

      {/* Hospitals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Nearby Hospitals & Blood Banks ({sortedHospitals.length})
        </h2>

        {sortedHospitals.length === 0 ? (
          <Card className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Hospitals Found</h3>
            <p className="text-slate-600">Try searching for a different city or hospital name.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedHospitals.map((hospital, index) => {
              const distance = getDistance(hospital);
              return (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card hover className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800">{hospital.hospitalName}</h3>
                            <Badge variant="success" className="mt-1">Verified</Badge>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-rose-600 font-medium">
                              <Navigation className="w-4 h-4" />
                              {distance} km
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-1 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {hospital.location.address}, {hospital.location.city}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {hospital.phone}
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedHospital(hospital);
                            setIsModalOpen(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetBooking}
        title={isBooked ? 'Booking Confirmed!' : 'Book Donation Session'}
        size="lg"
      >
        {isBooked ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Session Booked Successfully!</h3>
            <p className="text-slate-600 mb-4">
              Your donation session at <strong>{selectedHospital?.hospitalName}</strong> has been scheduled.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl mb-6">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span>{new Date(bookingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <span>{bookingTime}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 mb-6">
              <p className="font-medium">What to bring:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Valid ID proof (Aadhaar, PAN, Passport)</li>
                <li>Eat a healthy meal before donation</li>
                <li>Stay hydrated - drink plenty of water</li>
                <li>Get adequate sleep the night before</li>
              </ul>
            </div>
            <Button onClick={resetBooking} className="w-full">
              Done
            </Button>
          </div>
        ) : selectedHospital && (
          <div className="space-y-6">
            {/* Hospital Info */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedHospital.hospitalName}</h4>
                  <p className="text-sm text-slate-500">
                    {selectedHospital.location.address}, {selectedHospital.location.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <Input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={minDateStr}
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Time Slot
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setBookingTime(time)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      bookingTime === time
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Type Info */}
            <div className="p-4 bg-rose-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-600">Your Blood Type</p>
                  <p className="text-2xl font-bold text-rose-700">{donor?.bloodGroup}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-rose-600">Donation Units</p>
                  <p className="text-2xl font-bold text-rose-700">1 Unit</p>
                </div>
              </div>
            </div>

            {/* Eligibility Reminder */}
            <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
              <p className="font-medium mb-1">Eligibility Reminder:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You must be 18-65 years old</li>
                <li>Weight should be at least 50 kg</li>
                <li>Last donation should be at least 3 months ago</li>
                <li>No recent illness, tattoos, or piercings</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleBookSession}
                disabled={!bookingDate}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
