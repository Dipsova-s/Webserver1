*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags        	acc_wc    test

*** Variables ***
${JS_INJECTION_SCRIPT}            <script>alert("1")</script>

*** Test Cases ***
Search Item By Text "<script>alert(1)</script>"
  Search By Text    ${JS_INJECTION_SCRIPT}
  Page Should Contain    Bad Request
