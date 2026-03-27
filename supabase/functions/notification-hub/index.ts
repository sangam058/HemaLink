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
    const { record, old_record } = payload;

    // 1. Helper to fetch recipient email
    const getRecipientEmail = async (userId: string): Promise<string> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (error || !data?.email) {
        console.warn(`⚠️ Could not find email for user ${userId}`);
        return "delivered@resend.dev"; 
      }
      return data.email;
    };

    let subject = "";
    let htmlContent = "";
    let recipientEmail = "delivered@resend.dev"; // Default for free tier

    // 1. WELCOME EMAIL
    if (payload.table === "profiles" && payload.type === "INSERT") {
      recipientEmail = record.email;
      subject = `Welcome to Hemalink, ${record.name}! 🩸`;
      htmlContent = `<h1>Welcome ${record.name}!</h1><p>You joined as a ${record.role}.</p>`;
    }

    // 2. EMERGENCY BLOOD REQUEST
    else if (payload.table === "blood_requests" && payload.type === "INSERT" && record.priority === "emergency") {
      subject = `🚨 URGENT: Emergency Blood Request for ${record.blood_group}`;
      htmlContent = `<p>Emergency for ${record.units} units of ${record.blood_group} in ${record.location.city}.</p>`;
    }

    // 3. DONATION SESSION BOOKED
    else if (payload.table === "donations" && payload.type === "INSERT") {
      recipientEmail = await getRecipientEmail(record.donor_id);
      subject = `📅 Donation Scheduled!`;
      htmlContent = `<p>Hi ${record.donor_name}, donation scheduled at ${record.hospital_name} on ${new Date(record.scheduled_date).toLocaleString()}.</p>`;
    }

    // 4. LOW INVENTORY WARNING
    else if (payload.table === "blood_inventory" && payload.type === "UPDATE" && record.units < 5) {
      if (old_record && old_record.units >= 5) {
        recipientEmail = await getRecipientEmail(record.hospital_id);
        subject = `⚠️ Low Inventory Alert: ${record.blood_group}`;
        htmlContent = `<p>Inventory for ${record.blood_group} is low (${record.units} units).</p>`;
      }
    }

    // 5. NEW CAMPAIGN
    else if (payload.table === "campaigns" && payload.type === "INSERT") {
      subject = `📢 New Blood Donation Campaign: ${record.name}`;
      htmlContent = `<p>${record.hospital_name} is hosting: ${record.name}</p>`;
    }

    // 6. REQUEST STATUS UPDATED
    else if (payload.table === "blood_requests" && payload.type === "UPDATE") {
      recipientEmail = await getRecipientEmail(record.requester_id);
      if (record.status === 'fulfilled' && old_record?.status !== 'fulfilled') {
        subject = `✅ Request Fulfilled!`;
        htmlContent = `<p>Your request for ${record.blood_group} has been matched!</p>`;
      } else if (record.status === 'donor_assigned' && old_record?.status !== 'donor_assigned') {
        subject = `🩸 Donor Found!`;
        htmlContent = `<p>Donor ${record.assigned_donor_name} assigned!</p>`;
      }
    }

    if (!subject || !htmlContent) {
      return new Response(JSON.stringify({ message: "No action needed" }), { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: "Hemalink <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error(error);
      return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
