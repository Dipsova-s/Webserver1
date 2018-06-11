*** Variables ***
${pgbCreateAngleOptions}    jquery=#ChooseNewAngleOption .k-loading-mask

${btnButtonCreateAngleFromSchemaSimple}    ButtonCreateAngleFromSchemaSimple
${btnButtonCreateAngleFromSchemaDetailed}    ButtonCreateAngleFromSchemaDetailed
${btnButtonCreateAngleFromObjects}    ButtonCreateAngleFromObjects

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

Click Object Diagram Button
	Wait Until Element Is Visible    ${btnButtonCreateAngleFromSchemaDetailed}
	Wait Until Page Does Not Contain Element    ${pgbCreateAngleOptions}
	Click Link    ${btnButtonCreateAngleFromSchemaDetailed}

Click Object List Button
	Wait Until Element Is Visible    ${btnButtonCreateAngleFromObjects}
	Click Link    ${btnButtonCreateAngleFromObjects}