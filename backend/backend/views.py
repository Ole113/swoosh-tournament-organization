from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
import certifi
import json


def send_email(request):
    if request.method == 'POST':
        try:
            # Ensure Python uses the most up-to-date CA certificates
            os.environ['SSL_CERT_FILE'] = certifi.where()

            # Parse the JSON data from the request body
            data = json.loads(request.body)

            to_email = data.get('to_email', '')
            subject = data.get('subject', 'Test Email from Django Backend')
            html_content = data.get(
                'html_content', '<strong>This is a test email sent from Django using SendGrid!</strong>')

            message = Mail(
                from_email='',
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )

            sg = SendGridAPIClient("")
            response = sg.send(message)

            return JsonResponse({'message': 'Email sent successfully!'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
