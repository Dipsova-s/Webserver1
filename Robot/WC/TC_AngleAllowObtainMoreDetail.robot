*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Variables ***
${angleName}        Angle For Allow Obtain More Details Test
${fieldKeyword}     Material
${fieldId}          MaterialOnPlantLevel__OpenGRValuePlanned

*** Test Cases ***
Verify Angle For Allow Obtain More Details Test
    Search Angle From Search Page And Execute Angle    ${angleName}
    Element Should Be Visible    ${btnAddColumnToListDisplay}
    Click Toggle Angle
    Verify Disable Add Filter And Jump Button In Display Popup    False
    Verify Disable Drilldown    False
    Verify Disable Remove Column And Filter Button In Header Popop    False
    Set Angle To Not Allow User To Obtain More Details
    Element Should Not Be Visible    ${btnAddColumnToListDisplay}
    Verify Disable Add Filter And Jump Button In Display Popup    True
    Verify Disable Drilldown    True
    Verify Disable Remove Column And Filter Button In Header Popop    True
    Set Angle To Allow User To Obtain More Details




