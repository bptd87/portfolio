# Contact Form Email Setup

Your contact form is now functional! It will send emails to you when someone fills it out.

## Current Status
✅ Contact form endpoint created (`/api/contact`)
✅ Form validation (name, email, message required)
✅ Frontend updated with loading states and success/error messages
✅ Edge Function deployed

## To Enable Email Sending (Recommended)

### Step 1: Sign up for Resend (Free)
1. Go to https://resend.com/signup
2. Create a free account (100 emails/day free tier)
3. Verify your email address

### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "Brandon PT Davis Contact Form"
4. Copy the API key (starts with `re_`)

### Step 3: Add to Supabase
1. Go to https://supabase.com/dashboard/project/zuycsuajiuqsvopiioer/settings/functions
2. Scroll to "Edge Function Secrets"
3. Add two secrets:
   - Name: `RESEND_API_KEY`
     Value: `re_your_api_key_here`
   - Name: `CONTACT_EMAIL`
     Value: `your-email@gmail.com` (where you want to receive messages)
4. Click "Save"

### Step 4: Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to "Domains"
2. Add `brandonptdavis.com`
3. Add the DNS records they provide to your domain registrar
4. Once verified, emails will come from `noreply@brandonptdavis.com` instead of Resend's domain

## How It Works

**With Resend configured:**
- Form submissions send you an email immediately
- Reply-to is set to the visitor's email address
- Subject line includes their name and project type
- You get all their info in the email body

**Without Resend (fallback):**
- Form submissions are saved to Deno KV store with key `contact:timestamp`
- You can view them in Supabase dashboard or add an admin panel to read them
- Still functional, just no email notification

## Testing

1. Go to http://localhost:3000/contact (or your live site)
2. Fill out the form
3. Submit
4. You should see a green success message
5. Check your email (if Resend is configured) or KV store

## What Visitors See

✅ **Success:** "Thanks for reaching out! I'll get back to you soon."
❌ **Error:** "Sorry, there was an error sending your message. Please try emailing me directly."

## Security Features

- Email validation (regex check)
- Required field validation
- Rate limiting (handled by Supabase Edge Functions automatically)
- No spam bots (add reCAPTCHA later if needed)
