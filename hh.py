import requests
url = "https://nzjhorlykeqsxwgoyrcq.supabase.co/rest/v1/conversations"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56amhvcmx5a2Vxc3h3Z295cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzkwMzgsImV4cCI6MjA3MDc1NTAzOH0.6_hHw1mYfpisduVxqTffSBGQKN8xn-x6j0vOj7uQy2s",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56amhvcmx5a2Vxc3h3Z295cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzkwMzgsImV4cCI6MjA3MDc1NTAzOH0.6_hHw1mYfpisduVxqTffSBGQKN8xn-x6j0vOj7uQy2s"
}
response = requests.get(url, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")