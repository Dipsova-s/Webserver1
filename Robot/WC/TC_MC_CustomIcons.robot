*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to MC Then Login With Admin User
Suite Teardown      Logout MC Then Close Browser
Force Tags          acc_mc


*** Test Cases ***
Add verify and delete New Icon
    [Documentation]         This test adds new custom icons and verifies the uploaded icons and then deletes the added custom icons
    ...                     Risk Covered-This test covers the failures occurs while adding new custom icons and the failures in custom icons page
    Go To Custom Icons Page
    Add New Custom Icons And Save    ROBOT_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    ROBOT_icon
    Delete Adding Custom Icons    ROBOT_icon

Add verify and delete Test Icon
    [Documentation]         This test adds new different icons and verifies the uploaded icons and then deletes the added different icons
    ...                     Risk Covered-This test covers the failures occurs while adding new different icons and the failures in custom icons page
    Go To Custom Icons Page
    Add New Custom Icons And Save    Test_icon      ${TestIconFilePath}
    Verify Custom Icons Were Uploaded    Test_icon
    Delete Adding Custom Icons    Test_icon

Add verify and delete multiple icons
    [Documentation]         This test adds new custom multiple icons and verifies the uploaded icons and then deletes the added custom multiple icons
    ...                     Risk Covered-This test covers the failures occurs while adding new custom multiple icons and the failures in custom icons page
    Go To Custom Icons Page
    Add New Custom Icons And Save    Test1_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test1_icon
    Delete Adding Custom Icons     Test1_icon
    Add New Custom Icons And Save    Test2_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test2_icon
    Delete Adding Custom Icons     Test2_icon

Add verify then modify and delete New Icon
    [Documentation]         This test adds new custom icons, modifies and verifies the uploaded icons and then deletes the added custom icons
    ...                     Risk Covered-This test covers the failures occurs while adding, modifying new custom icons and the failures in custom icons page
    Go To Custom Icons Page
    Add New Custom Icons And Save    Test3_icon     ${IconFilePath}
    Verify Custom Icons Were Uploaded    Test3_icon
    Edit Custom Icons Field     Test3_icon
    Delete Adding Custom Icons     Edited_Icon



