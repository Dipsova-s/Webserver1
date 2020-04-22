*** Variables ***
${btnAddRole}                   css=#subRoles
${btnSaveRole}                  css=.btnSave

#Select role popup
${trRowInSelectRoleGrid}            AvailableRoleGridContainer tbody tr
${btnSaveSelectedRole}              css=.btnAddRoles

${divBusinessProcesses}             jquery=.businessProcesses .businessProcessesItem

${gridAssignRolesFirst}    jquery=#GridAssignRoles .k-grid-content tr
${btnDeleteInGridAssignRoles}    .btnDelete

${LocatorButtonMassChange}           xpath=//a[@id='MassChangeUsersBtn' and @class='btn']
${LocatorDropdownUserRole}           xpath=//select[@id='MassChangeUsersRole']/..
${LocatorRadioButtonAddRoles}       id=MassChangeAddRoles
${LocatorRadioButtonRemoveRole}       id=MassChangeRemoveRole
${LocatorTextSuccessMessage1}       xpath=//li[contains(text(),'success')][1]
${LocatorTextSuccessMessage2}       xpath=//li[contains(text(),'success')][2]
${LocatorPopupClosepopup}          xpath=//div[contains(@class,'typeInfo')]//a
${LocatorButtonSave}               xpath=//a[@onclick='MC.Users.User.SaveMassChangeUsers()']
${LocatorUserEABasic}              xpath=//td[text()='local\\EABasic']
${LocatorUserEAViewer}             xpath=//td[text()='local\\EAViewer']
${LocatorRolesOfEABasic}            xpath=//td[text()='local\\EABasic']/..//td[6]
${LocatorRolesOfEAViewer}           xpath=//td[text()='local\\EAViewer']/..//td[6]
${LocatorAccessToModelOfEABasic}     xpath=//td[text()='local\\EABasic']/../td[4]
${LocatorAccessToModelOfEAViewer}     xpath=//td[text()='local\\EAViewer']/../td[4]
${LocatorDropDownValuesMassChangeUsersRole}   xpath=//select[@id='MassChangeUsersRole']/option
${LocatorPopupMassChangeUsersLoadingDisappear}   css=#popupMassChangeUsers .k-loading-mask
${LocatorDropDownMassChange}                    css=#popupMassChangeUsers .k-widget.k-multiselect

*** Keywords ***

Click Add Role To User
    Wait Until Page Contains Element    ${btnAddRole}
    Click Element    ${btnAddRole}
    Wait Until Page Contains    Select roles to add

Click Add Selected Role To User
    Click Element    ${btnSaveSelectedRole}

Click Save Role To User
    Wait Until Element Is Visible    ${btnSaveRole}
    Click Element    ${btnSaveRole}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   Add users
    Wait Until Page Contains   Mass change
    Sleep    ${TIMEOUT_GENERAL}

#Select role popup
Click Select Role By Role Name
    [Arguments]    ${roleName}
    Wait Until Page Contains Element    jquery=#${trRowInSelectRoleGrid}:contains(${roleName})
    Click Element    jquery=#${trRowInSelectRoleGrid}:contains(${roleName})

Click Add Business Process To User
    [Arguments]    ${businessProcessName}   ${chbOption}
    Set Checkbox   ${businessProcessName}    ${chbOption}

Click Add Multiple Business Process To User
    [Arguments]    ${businessProcessName}   ${businessProcessName2}
    Click Add Business Process To User      ${businessProcessName}
    Click Add Business Process To User      ${businessProcessName2}

Select User EABasic
    Wait Until Element Is Visible  ${LocatorUserEABasic} 
    Custom click element  ${LocatorUserEABasic} 

Select User EAViewer
    Wait Until Element Is Visible  ${LocatorUserEAViewer} 
    Custom click element  ${LocatorUserEAViewer}

Click on button Mass change 
    Wait Until Element Is Enabled   ${LocatorButtonMassChange}   error=Button 'Mass change' is not enabled
    Custom click element  ${LocatorButtonMassChange}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element   ${LocatorPopupMassChangeUsersLoadingDisappear}  
    Wait Until Page Contains Element   ${LocatorDropDownMassChange} 

Select radio button 'Add roles'  
    Wait Until Ajax Complete
    Select Radio Button  UsersMassChangeType  add

Select radio button 'Remove roles' 
    Wait Until Ajax Complete
    Select Radio Button   UsersMassChangeType  remove

Select the role <Model>_ALL from 'Mass change' dropdown
    Wait Until Ajax Complete
    Wait Until Element Is Visible  ${LocatorDropdownUserRole}
    Custom click element  ${LocatorDropdownUserRole}
    ${MassChangeUsersRoleList}=  Get WebElements   ${LocatorDropDownValuesMassChangeUsersRole} 
    ${count}=  set variable  0
    :For  ${EachElementInDropDown}  IN  @{MassChangeUsersRoleList}
    \   ${EachvalueInDropDown}=  Get text  ${EachElementInDropDown}
    \   Run Keyword If  '${EachvalueInDropDown}' == 'SYSTEM_ALL'	Continue For Loop
    \   ${T/F}=   Run Keyword And Return Status   Should End With   ${EachvalueInDropDown}  _ALL
    \   ${count}=   Run keyword if  ${T/F}==True  set variable   1
    \   Run keyword if   ${count}==1   Exit For Loop
    
    log  ${count}
    Set global variable   ${EachvalueInDropDown}  ${EachvalueInDropDown}
    Run keyword if  ${count}==1  Custom click element    xpath=//select[@id='MassChangeUsersRole']/option[text()='${EachvalueInDropDown}']
    ...  ELSE   Fail  The role '<Model>_ALL' from 'Mass change' dropdown doesnot exist

Validate dialog box is shown with a success message
    Wait Until Ajax Complete
    Wait Until Element Is Visible   ${LocatorTextSuccessMessage1}  
    Page should contain element  ${LocatorTextSuccessMessage1}  
    Page should contain element  ${LocatorTextSuccessMessage2}

Close Mass change report popup
    Custom click element  ${LocatorPopupClosepopup}
    Wait Until Ajax Complete
    Wait Until All Users Page Ready
    
Note down the number in the 'Roles' column for the users
    ${No.OfRolesBeforeAddingForUser1}=  Get Text  ${LocatorRolesOfEABasic}
    ${No.OfRolesBeforeAddingForUser2}=  Get Text  ${LocatorRolesOfEAViewer}
    Set global variable   ${No.OfRolesBeforeAddingForUser1}  ${No.OfRolesBeforeAddingForUser1}
    Set global variable   ${No.OfRolesBeforeAddingForUser2}  ${No.OfRolesBeforeAddingForUser2}

Validate the number in the 'Roles' column has increased by one for the user   

    Wait Until Page Contains Element   ${LocatorRolesOfEABasic}
    Wait Until Element Is Visible      ${LocatorRolesOfEABasic}
    ${No.OfRolesAfterAddingForUser1}=  Get Text  ${LocatorRolesOfEABasic}
    ${No.OfRolesAfterAddingForUser2}=  Get Text  ${LocatorRolesOfEAViewer}

    Run keyword if  ${No.OfRolesAfterAddingForUser1}==${No.OfRolesBeforeAddingForUser1}+1  Log To Console  Number in the 'Roles' column increased by one for user1
    ...    ELSE  Fail    Number in the 'Roles' column has not increased by one for user1

    Run keyword if  ${No.OfRolesAfterAddingForUser2}==${No.OfRolesBeforeAddingForUser2}+1  Log To Console  Number in the 'Roles' column increased by one for user2
    ...    ELSE  Fail    Number in the 'Roles' column has not increased by one for user2 

Validate Model has been added to 'Access to model' column for the user
    ${valueInDropDownWhileSelecting}=  Remove String	${EachvalueInDropDown}	_ALL	
    Wait Until Page Contains Element   ${LocatorAccessToModelOfEABasic}
    Wait Until Element Is Visible    ${LocatorAccessToModelOfEABasic}
    ${ModelNameAfterAddingForUser1}=  Get Text   ${LocatorAccessToModelOfEABasic}
    ${ModelNameAfterAddingForUser2}=  Get Text   ${LocatorAccessToModelOfEAViewer}

    Run keyword if  '${valueInDropDownWhileSelecting}'=='${ModelNameAfterAddingForUser1}'  Log To Console  Model has been added to 'Access to model' column for user1
    ...    ELSE  Fail    Model has not been added to 'Access to model' column for user1

    Run keyword if  '${valueInDropDownWhileSelecting}'=='${ModelNameAfterAddingForUser2}'  Log To Console  Model has been added to 'Access to model' column for user2
    ...    ELSE  Fail    Model has not been added to 'Access to model' column for user2

Click on 'Save' in Mass change popup
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element   ${LocatorPopupMassChangeUsersLoadingDisappear}
    Wait Until Element Is Visible  ${LocatorButtonSave}
    Custom click element   ${LocatorButtonSave}
    Wait Until Ajax Complete
