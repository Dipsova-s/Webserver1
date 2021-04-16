*** Keywords ***
Go to User Defaults page in MC
    Go To MC Page    Users/User%20defaults/
    Wait MC Progress Bar Closed    
    Wait Until Page Contains    User default settings