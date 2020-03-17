*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To All Users Page With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Teardown       Go To All Users Page
Force Tags          acc_mc


*** Test Cases ***
Test CRUD User
    [Documentation]     This test performs the Crud Operation Adding and Deleting the User
    [Tags]  acc_mc_aci
    Add User
    Delete User    ${username}

Add roles to user
    [Tags]   TC_C642
    [Documentation]     This test is to validate adding roles to user through Mass Change

    # Precondition
    Users should not have <Model>_ALL role
    # Tests
    Note down the number in the 'Roles' column for the users
    Select User EABasic
    Select User EAViewer
    Click on button Mass change
    Select radio button 'Add roles'
    Select the role <Model>_ALL from 'Mass change' dropdown
    Click on 'Save' in Mass change popup
    Validate dialog box is shown with a success message
    Close Mass change report popup
    Validate the number in the 'Roles' column has increased by one for the user
    Validate Model has been added to 'Access to model' column for the user

    # Roll back the role
    Users should not have <Model>_ALL role
