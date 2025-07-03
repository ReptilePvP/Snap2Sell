# Custom Email Templates for Snapalyze

This directory contains custom email templates for Supabase authentication emails.

## 📧 Available Templates

### 1. Email Confirmation (`confirm-signup.html` & `confirm-signup.txt`)
- **Purpose**: Email confirmation for new user signups
- **Color Scheme**: Blue gradient (`#3b82f6` → `#1d4ed8`)
- **Features**: Welcome message, feature highlights, call-to-action

### 2. Password Reset (`recovery.html` & `recovery.txt`)
- **Purpose**: Password reset requests
- **Color Scheme**: Red gradient (`#dc2626` → `#b91c1c`)
- **Features**: Security notices, expiration warnings, help section

### 3. Email Change (`email-change.html` & `email-change.txt`)
- **Purpose**: Email address change confirmation
- **Color Scheme**: Green gradient (`#059669` → `#047857`)
- **Features**: New email display, step-by-step process, security info

## 🚀 How to Set Up in Supabase

### Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication → Email Templates
3. **For each template**:
   - **Confirm signup**: Use `confirm-signup.html`
   - **Reset password**: Use `recovery.html`
   - **Change email**: Use `email-change.html`
4. **Replace the default HTML** with the respective template content
5. **Save changes**

### Method 2: Supabase CLI

```bash
# Navigate to your project directory
cd /path/to/your/project

# Update email templates using Supabase CLI
supabase settings update auth --email-template-signup-subject "Welcome to Snapalyze! Confirm your email"
supabase settings update auth --email-template-recovery-subject "Reset your Snapalyze password"
supabase settings update auth --email-template-email-change-subject "Confirm your new email - Snapalyze"
```

## 📋 Template Variables

The following variables are automatically replaced by Supabase:

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address (if needed)
- `{{ .RedirectTo }}` - Redirect URL after confirmation

## 🎨 Customization Options

### Colors & Branding
- **Primary Blue**: `#3b82f6` → `#1d4ed8` (gradient)
- **Background**: `#f8fafc`
- **Text Colors**: `#1f2937` (dark), `#6b7280` (medium)

### Features Section
Update the features in the HTML template:
```html
<div class="features">
    <div class="feature">
        <div class="feature-icon">🔍</div>
        <div class="feature-title">Your Feature</div>
        <div class="feature-desc">Feature description</div>
    </div>
</div>
```

### Footer Links
Update the footer links to match your actual pages:
```html
<a href="https://www.snapalyze.org" class="footer-link">Visit our website</a>
<a href="https://www.snapalyze.org/support" class="footer-link">Get support</a>
```

## 📱 Mobile Responsiveness

The template includes responsive design that:
- Adapts to small screens
- Stacks features vertically on mobile
- Adjusts padding and font sizes
- Maintains readability across devices

## 🔒 Security Features

- Includes expiration notice (24 hours)
- Clear call-to-action button
- Alternative text link for accessibility
- Trusted sender branding

## 🧪 Testing

### Test the Email Template:
1. Create a test user account
2. Check your email for the confirmation
3. Verify all links work correctly
4. Test on different email clients (Gmail, Outlook, etc.)

### Email Client Compatibility:
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Mobile clients

## 📊 Analytics

Consider adding UTM parameters to track email engagement:
```html
<a href="{{ .ConfirmationURL }}&utm_source=email&utm_medium=confirmation&utm_campaign=signup">
```

## 🔄 Future Templates

You can create similar templates for:
- Password reset emails
- Magic link emails  
- Welcome emails (post-confirmation)
- Account update notifications

## 📝 Notes

- The HTML template has a fallback text version for better compatibility
- Images are avoided to prevent spam filter issues
- Inline CSS is used for maximum email client support
- The design matches your Snapalyze brand colors and style
