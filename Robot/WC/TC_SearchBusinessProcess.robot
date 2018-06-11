*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Test Template    	Search Business Process
Force Tags        	acceptance    acc_wc


*** Test Cases ***                                  Name
Search Angle By Filter Business Process P2P         P2P
Search Angle By Filter Business Process S2D         S2D
Search Angle By Filter Business Process O2C         O2C
Search Angle By Filter Business Process F2R         F2R
Search Angle By Filter Business Process PM          PM
Search Angle By Filter Business Process HCM         HCM
Search Angle By Filter Business Process GRC         GRC
Search Angle By Filter Business Process IT          IT
