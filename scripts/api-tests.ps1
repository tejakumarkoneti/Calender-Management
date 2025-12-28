$ts = [int](Get-Date -UFormat %s)
$email = "test_$ts@example.com"
Write-Output "Registering $email"
try {
  $reg = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/register' -ContentType 'application/json' -Body (@{email=$email; password='secret123'; timezone='America/New_York'} | ConvertTo-Json)
  Write-Output "Register success:"
  $reg | ConvertTo-Json -Depth 5
} catch {
  Write-Output "Register failed:"
  if ($_.Exception.Response -ne $null) { $_.Exception.Response.Content.ReadAsStringAsync().Result } else { $_.Exception.Message }
  exit 1
}
try {
  $login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{email=$email; password='secret123'} | ConvertTo-Json)
  Write-Output "Login success:"
  $login | ConvertTo-Json -Depth 5
  Write-Output "TOKEN:"
  $login.token
} catch {
  Write-Output "Login failed:"
  if ($_.Exception.Response -ne $null) { $_.Exception.Response.Content.ReadAsStringAsync().Result } else { $_.Exception.Message }
  exit 1
}
