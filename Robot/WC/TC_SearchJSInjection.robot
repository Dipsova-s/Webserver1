*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acceptance     acc_wc

*** Variables ***
${JS_INJECTION_SCRIPT}            <script>alert("1")</script>

*** Test Cases ***
Search Item By Text "<script>alert(1)</script>"
  Search By Text    ${JS_INJECTION_SCRIPT}
  Run Keyword And Expect Error    There were no alerts   AlertFail

*** Keyword ***
AlertFail
  Alert Should Be Present   "1"