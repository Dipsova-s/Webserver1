*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Force Tags          TRI

*** Test Cases ***
# 1 PASS and 1 FAIL
Test case Title 1
    [Tags]  AsmokeTest   TC_C221  TC_C226

    should be equal   Text   Text

Test case Title 2
     [Tags]  BIntegrationTest   TC_C221
     should be equal  Text   Text1

# 2 PASS 
Test case Title 3
    [Tags]  AsmokeTest   TC_C222

    should be equal   Text   Text

Test case Title 4
    [Tags]  AsmokeTest   TC_C222

    should be equal   Text   Text

# 2 FAIL
Test case Title 5
    [Tags]  AsmokeTest   TC_C223

    should be equal  Text   Text1   

Test case Title 6
    [Tags]  AsmokeTest   TC_C223

    should be equal  Text   Text1

# 1 PASS
Test case Title 7
    [Tags]  AsmokeTest   TC_C224

    should be equal   Text   Text  

#1 FAIL
Test case Title 8
    [Tags]  AsmokeTest   TC_C225

    should be equal  Text   Text1

# Combination more than 1 pass and more than 1 fail

Test case Title 8
    [Tags]  AsmokeTest   TC_C226

    should be equal  Text   Text

Test case Title 9
    [Tags]  AsmokeTest   TC_C226

    should be equal  Text   Text

Test case Title 10
    [Tags]  AsmokeTest   TC_C226

    should be equal  Text   Text1

Test case Title 11
    [Tags]  AsmokeTest   TC_C226

    should be equal  Text   Text1   

# Combination more than 2 pass and 1 fail

Test case Title 12
    [Tags]  AsmokeTest   TC_C26269

    should be equal  Text   Text

Test case Title 13
    [Tags]  AsmokeTest   TC_C26269

    should be equal  Text   Text

Test case Title 14
    [Tags]  AsmokeTest   TC_C26269

    should be equal  Text   Text2

Test case Title 15
    [Tags]  AsmokeTest   TC_C9666777555

    should be equal  Text   Text2

Test case Title 16
    [Tags]  AsmokeTest   TC_C96667775553

    should be equal  Text   Text