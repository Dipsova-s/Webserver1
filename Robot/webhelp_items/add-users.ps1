$Password = ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force
New-LocalUser "msmith" -Password $Password -FullName "Mary Smith" -Description "Webhelp user for English" -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword
New-LocalUser "adubois" -Password $Password -FullName "Aveline Dubois" -Description "Webhelp user for French" -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword
New-LocalUser "cmueller" -Password $Password -FullName "Christian Muller" -Description "Webhelp user for German" -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword
New-LocalUser "edejong" -Password $Password -FullName "Emma de Jong" -Description "Webhelp user for Dutch" -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword
New-LocalUser "jgarcia" -Password $Password -FullName "Javier Garcia" -Description "Webhelp user for Spanish" -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword

Add-LocalGroupMember -Group "Users" -Member "msmith"
Add-LocalGroupMember -Group "Users" -Member "adubois"
Add-LocalGroupMember -Group "Users" -Member "cmueller"
Add-LocalGroupMember -Group "Users" -Member "edejong"
Add-LocalGroupMember -Group "Users" -Member "jgarcia"