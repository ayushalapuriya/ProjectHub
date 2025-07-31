const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // For development, we'll use console logging
    // In production, configure with real SMTP settings
    this.transporter = null;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!this.isDevelopment) {
      this.setupTransporter();
    }
  }

  setupTransporter() {
    // Configure nodemailer transporter for production
    // Example with Gmail:
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendInvitationEmail(invitation) {
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitation.token}`;
    
    const emailContent = {
      to: invitation.email,
      subject: 'You\'re invited to join ProjectHub!',
      html: this.generateInvitationHTML(invitation, invitationLink),
      text: this.generateInvitationText(invitation, invitationLink)
    };

    if (this.isDevelopment) {
      // In development, log the email content
      console.log('\n=== EMAIL INVITATION ===');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Invitation Link:', invitationLink);
      console.log('Message:', emailContent.text);
      console.log('========================\n');
      
      return {
        success: true,
        messageId: 'dev-' + Date.now(),
        invitationLink
      };
    } else {
      // In production, send actual email
      try {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@projecthub.com',
          ...emailContent
        });
        
        return {
          success: true,
          messageId: info.messageId,
          invitationLink
        };
      } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send invitation email');
      }
    }
  }

  generateInvitationHTML(invitation, invitationLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ProjectHub Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited to ProjectHub!</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p><strong>${invitation.invitedBy.name}</strong> has invited you to join their team on ProjectHub as a <strong>${invitation.role}</strong>.</p>
            
            ${invitation.department ? `<p><strong>Department:</strong> ${invitation.department}</p>` : ''}
            
            ${invitation.message ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p><strong>Personal message:</strong></p>
                <p style="font-style: italic;">"${invitation.message}"</p>
              </div>
            ` : ''}
            
            <p>ProjectHub is a powerful project management platform that helps teams collaborate effectively and get things done.</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Accept Invitation</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${invitationLink}">${invitationLink}</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
              This invitation will expire in 7 days. If you don't want to join, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 ProjectHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateInvitationText(invitation, invitationLink) {
    return `
You're invited to join ProjectHub!

${invitation.invitedBy.name} has invited you to join their team on ProjectHub as a ${invitation.role}.

${invitation.department ? `Department: ${invitation.department}` : ''}

${invitation.message ? `Personal message: "${invitation.message}"` : ''}

ProjectHub is a powerful project management platform that helps teams collaborate effectively and get things done.

To accept this invitation, click the link below:
${invitationLink}

This invitation will expire in 7 days. If you don't want to join, you can safely ignore this email.

© 2024 ProjectHub. All rights reserved.
    `.trim();
  }

  async sendNotificationEmail(user, notification) {
    const emailContent = {
      to: user.email,
      subject: `ProjectHub: ${notification.title}`,
      html: this.generateNotificationHTML(user, notification),
      text: this.generateNotificationText(user, notification)
    };

    if (this.isDevelopment) {
      console.log('\n=== EMAIL NOTIFICATION ===');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Message:', emailContent.text);
      console.log('==========================\n');
      
      return { success: true, messageId: 'dev-' + Date.now() };
    } else {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@projecthub.com',
          ...emailContent
        });
        
        return { success: true, messageId: info.messageId };
      } catch (error) {
        console.error('Notification email sending failed:', error);
        throw new Error('Failed to send notification email');
      }
    }
  }

  generateNotificationHTML(user, notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ProjectHub Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.title}</h2>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>${notification.message}</p>
            <p>Best regards,<br>ProjectHub Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateNotificationText(user, notification) {
    return `
Hi ${user.name},

${notification.title}

${notification.message}

Best regards,
ProjectHub Team
    `.trim();
  }
}

module.exports = new EmailService();
