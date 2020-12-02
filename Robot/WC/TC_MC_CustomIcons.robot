*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Close Browser
Force Tags          acc_mc


*** Test Cases ***
verify Add and delete multiple icons
    [Documentation]         This test adds new custom multiple icons and verifies the uploaded icons and then deletes the added custom multiple icons
    ...                     Risk Covered-This test covers the failures occurs while adding new custom multiple icons and the failures in custom icons page
    Go To Custom Icons Page
    Add New Custom Icons And Save    Test1_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test1_icon
    Delete Adding Custom Icons     Test1_icon
    Add New Custom Icons And Save    Test2_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test2_icon
    Delete Adding Custom Icons     Test2_icon

Verify Add, Edit And Delete Custom Icon
    [Documentation]         This test adds new custom icons, modifies and verifies the uploaded icons and then deletes the added custom icons
    ...                     Risk Covered-This test covers the failures occurs while adding, modifying new custom icons and the failures in custom icons page
    [Tags]  acc_mc_aci
    Go To Custom Icons Page
    Add New Custom Icons And Save    Test_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test_icon
    Edit Custom Icons Field     Test_icon
    Edit Custom Icons       Edited_Icon       ${TestIconFilePath}
    Delete Adding Custom Icons     Edited_Icon



