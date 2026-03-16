import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, record, old_record } = payload;

    // In a real generic setup, sending to dynamic emails usually depends on fetching from profiles
    // For free tier Resend, you MUST use the verified sender and to address. We'll simulate structure here.
    const sender = "Hemalink <onboarding@resend.dev>";
    // IMPORTANT: Free Resend only lets you send TO your own verified Deno Account email.
    // Replace this with your actual verified email address.
    const defaultRecipient = "delivered@resend.dev";

    let subject = "";
    let htmlContent = "";

    // 1. WELCOME EMAIL (Triggered when new row inserted to 'profiles')
    if (payload.table === "profiles" && payload.type === "INSERT") {
      subject = `Welcome to Hemalink, ${record.name}! 🩸`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #e11d48;">Welcome to Hemalink!</h1>
          <p>Hi ${record.name},</p>
          <p>Thank you for joining our platform as a <strong>${record.role}</strong>. You are now part of a community dedicated to saving lives through blood donation.</p>
          ${record.role === 'donor'
          ? `<p>Head over to your dashboard to see nearby blood requests or schedule a donation today!</p>`
          : `<p>Head over to your dashboard to manage your requests and campaigns.</p>`}
          <p>Best regards,<br>The Hemalink Team</p>
        </div>
      `;
    }

    // 2. EMERGENCY BLOOD REQUEST (Broadcasted to donors)
    else if (payload.table === "blood_requests" && payload.type === "INSERT" && record.priority === "emergency") {
      subject = `🚨 URGENT: Emergency Blood Request for ${record.blood_group} in ${record.location.city || 'your area'}`;

      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #e11d48; border-radius: 8px;">
          <h1 style="color: #e11d48;">🚨 EMERGENCY BLOOD REQUEST</h1>
          <p>An emergency request for <strong>${record.units} unit(s) of ${record.blood_group} blood</strong> has just been created by ${record.hospital_name || record.requester_name}.</p>
          <p><strong>Date Needed:</strong> ${new Date(record.date_needed).toLocaleDateString()}</p>
          <p>If you or someone you know can donate, please open Hemalink immediately to accept the request. Your immediate action could save a life!</p>
          <a href="https://hemalink.vercel.app/requests" style="display: block; padding: 12px 20px; background-color: #e11d48; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">View Emergency Request</a>
        </div>
      `;

      // In production (paid Resend), you would query supabase here to find all eligible donors 
      // in that city with matching blood type and loop through their emails.
    }

    // 3. DONATION SESSION BOOKED (Sent to Donor)
    else if (payload.table === "donations" && payload.type === "INSERT") {
      subject = `📅 Donation Scheduled Confirmed!`;

      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #10b981;">Donation Scheduled!</h2>
          <p>Hi ${record.donor_name},</p>
          <p>Your blood donation has been successfully scheduled. Thank you for stepping up!</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p><strong>Hospital:</strong> ${record.hospital_name}</p>
            <p><strong>Date:</strong> ${new Date(record.scheduled_date).toLocaleString()}</p>
            <p><strong>Blood Group:</strong> ${record.blood_group}</p>
            <p><strong>Units:</strong> ${record.units}</p>
          </div>
          <p><strong>Preparation Tips:</strong></p>
          <ul>
            <li>Drink plenty of water before your appointment.</li>
            <li>Eat a light, healthy meal.</li>
            <li>Bring a valid photo ID.</li>
          </ul>
        </div>
      `;
    }

    // 4. LOW INVENTORY WARNING (Sent to Hospital)
    else if (payload.table === "blood_inventory" && payload.type === "UPDATE" && record.units < 5) {
      // Only send if old record was >= 5 to prevent spamming on every update
      if (old_record && old_record.units >= 5) {
        subject = `⚠️ Low Inventory Alert: ${record.blood_group} drops below 5 units`;

        // Fetch hospital email to send to real admin in prod
        // const { data: hospital } = await supabase.from('profiles').select('email').eq('id', record.hospital_id).single();

        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Low Inventory Warning</h2>
            <p>Attention Hospital Admin,</p>
            <p>Your inventory for <strong>${record.blood_group}</strong> has dropped to <strong>${record.units} units</strong>.</p>
            <p>It is highly recommended to host a blood donation campaign immediately to restock your critical supply.</p>
            <a href="https://hemalink.vercel.app/hospital/campaigns" style="display: block; padding: 12px 20px; background-color: #f59e0b; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Create Campaign</a>
          </div>
        `;
      }
      // 5. NEW CAMPAIGN CREATED (Sent directly to Donors usually, but here just generic)
      else if (payload.table === "campaigns" && payload.type === "INSERT") {
        subject = `📢 New Blood Donation Campaign: ${record.name}`;

        htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Join Our New Campaign!</h2>
          <p><strong>${record.hospital_name}</strong> is hosting a blood donation campaign and needs your help!</p>
          <div style="background-color: #eff6ff; padding: 15px; margin: 20px 0;">
            <p><strong>Campaign:</strong> ${record.name}</p>
            <p><strong>Location:</strong> ${record.location.address}, ${record.location.city}</p>
            <p><strong>Start Date:</strong> ${new Date(record.start_date).toLocaleDateString()}</p>
          </div>
          <p>${record.description}</p>
          <p>Your contribution can save multiple lives. Please consider registering for this campaign on Hemalink.</p>
          <a href="https://hemalink.vercel.app/campaigns" style="display: block; padding: 12px 20px; background-color: #3b82f6; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">View Campaign Details</a>
        </div>
      `;
      }

      if (!subject || !htmlContent) {
        return new Response(JSON.stringify({ message: "No email condition met for this payload." }), { headers: { "Content-Type": "application/json" } });
      }

      const { data, error } = await resend.emails.send({
        from: sender,
        to: [defaultRecipient], // Note: For Resend free tier, this MUST be your verified email.
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        console.error(error);
        return new Response(JSON.stringify({ error }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });

    }
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
