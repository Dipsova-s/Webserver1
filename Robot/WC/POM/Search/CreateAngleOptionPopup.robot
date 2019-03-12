*** Variables ***
${pgbCreateAngleOptions}    jquery=#ChooseNewAngleOption .k-loading-mask

${btnButtonCreateAngleFromSchemaSimple}    ButtonCreateAngleFromSchemaSimple
${btnButtonCreateAngleFromSchemaDetailed}    ButtonCreateAngleFromSchemaDetailed
${btnButtonCreateAngleFromObjects}    ButtonCreateAngleFromObjects
${btnBackToCreateAngleOptions}    btn-popupCreateNewAngleBySchema2
${p2pBusinessProcess}		css=.businessProcessesItem.P2P		

${imgCreateAngleFromSchemaSimple}    jquery=#ChooseNewAngleOption img:eq(0)
${imgCreateAngleFromSchemaDetailed}    jquery=#ChooseNewAngleOption img:eq(1)
${imgCreateAngleFromObjects}    jquery=#ChooseNewAngleOption img:eq(2)

*** Keywords ***
Wait Create Angle Popup Document Loaded
	Wait Until Page Contains Element    ${btnButtonCreateAngleFromSchemaSimple}
	Wait Until Page Contains Element    ${btnButtonCreateAngleFromSchemaDetailed}
	Wait Until Page Contains Element    ${btnButtonCreateAngleFromObjects}

Click Object Activity Diagram Button
	Wait Until Element Is Visible    ${btnButtonCreateAngleFromSchemaSimple}
	Wait Until Page Does Not Contain Element    ${pgbCreateAngleOptions}
	Click Link    ${btnButtonCreateAngleFromSchemaSimple}
	Wait Create Angle Popup Option Activity Diagram Loaded

Click Object Diagram Button
	Wait Until Element Is Visible    ${btnButtonCreateAngleFromSchemaDetailed}
	Wait Until Page Does Not Contain Element    ${pgbCreateAngleOptions}
	Click Link    ${btnButtonCreateAngleFromSchemaDetailed}
	Wait Create Angle Popup Option Object Diagram Loaded

Click Object List Button
	Wait Until Element Is Visible    ${btnButtonCreateAngleFromObjects}
	Click Link    ${btnButtonCreateAngleFromObjects}
    Wait Create Angle Popup Option Object List Loaded

Click Back Button To Back To Create Angle Options 
	Click Element   ${btnBackToCreateAngleOptions}
	Wait Until Ajax Complete

Click P2P Business Processes On Create Angle Diagram Options
	Click Element    ${p2pBusinessProcess}
	Wait Until Ajax Complete
