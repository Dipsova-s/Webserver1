*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_WC}
Test Template       Login And Expected Result
Force Tags          smoke
*** Test Cases ***                  USER          PASS       Expected Result
#Invalid Username            		invalid       P@ssw0rd   Unauthorized: Invalid username or password.
Invalid Password            		\\eapower     invalid    Unauthorized: Logon failure: unknown user name or bad password
#Invalid Username And Password    	invalid       whatever   Unauthorized: Invalid username or password.
Empty Username    					${EMPTY}      P@ssw0rd   Please enter your username and password
Empty Password    					\\eapower     ${EMPTY}   Please enter your username and password
Empty Username And Password    		${EMPTY}      ${EMPTY}   Please enter your username and password