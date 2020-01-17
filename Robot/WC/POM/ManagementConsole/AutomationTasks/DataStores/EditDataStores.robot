*** Variables ***
${btnSaveEditDataStoresGrid}      css=.btnSave
${btnCancelEditDataStoresGrid}    css=.btnBack

${txtDatastoreName}    css=#name
${cbSupportsWrite}    supports_write
${cbSupportsRead}    supports_read
${chkboxDefaultDataStore}   is_default

${txtSQLServerName}    css=#connection_host
${txtSQLUsername}    css=#connection_user
${txtSQLPassword}    css=#connection_password
${txtSQLDatabase}    css=#connection_database
${ckbIntegratedSecurity}    use_integrated_security
${btnTestConnection}    btnTestConnection

${txtOutputFolder}      connection_folder

${txtModelTimestampIndex}    model_timestamp_index
${ddlHeaderFormat}  header_format
${ddlSetFormat}    enum_format
${txtMaxRowsToExport}    max_rows_to_export
${txtTableName}    css=#table_name
${ckbAppendResult}    append
${txtDatastoreFileName}      css=#file_name
${ddlTemplateFileName}      template_file
${txtDatastoreSheetName}     css=#sheet_name
${ckbTechInfo}      include_techinfo

${ckbAngleSummary}      add_angle_summary
${ckbAngleDefinition}       add_angle_definition

${txtDecimalSeparator}      css=#decimal_separator
${ddlNumberofDecimals}      number_of_decimals
${ddlTimeFormat}        time_format
${txtTimeSeparator}     css=#time_separator
${ddlDateFormater}      date_format
${txtDateSeparator}     css=#date_separator
${txtValueYes}      css=#bool_format_true
${txtValueNo}       css=#bool_format_false
${ddlEnquote}       csv_enquote
${chkboxEncouteHeader}      csv_enquote_headers
${txtFieldSeparator}        css=#csv_field_separator
${ddlLineSeparator}     csv_line_separator
${txtEnquoteCharacter}      css=#csv_enquote_character
${txtDeleteionTimeout}      deletion_timeout

${dataGridDataStoresGrid}       DataStoresGrid
${lblStatusInfo}       css=.statusInfo
${txtDatastoreFilter}       css=#AutomationTasksFilterTextbox

${trRowDatastoreGrid}               jquery=#DataStoresGridContainer tbody tr
${btnEditAction}                .btnGroupContainer a:first
${btnActionDropDown}    .btn btnEdit
${btnDeleteAction}      .btnGroupInner .btnDelete
${btnDeleteDatastore}        xpath=(//a[@class='btn btnPrimary btnSubmit'])[2]
${tblDatastoresGridRows}    css=#DataStoresGrid .k-grid-content tr

*** Keywords ***
Fill Create New Datastore
    [Arguments]     ${datastoreName}     ${defaultDataStore}
    Input Text  ${txtDatastoreName}    ${datastoreName}
    Run Keyword If    '${defaultDataStore}' == 'check'      Select Checkbox      ${chkboxDefaultDataStore}
    Run Keyword If    '${defaultDataStore}' == 'uncheck'      Unselect Checkbox      ${chkboxDefaultDataStore}

Fill Connection Settings
    [Arguments]     ${outputFolder}
    Input Text  ${txtOutputFolder}      ${outputFolder}
    Click Element      ${btnTestConnection}
    Wait Until Ajax Complete
    Element Text Should Be      ${lblStatusInfo}     A connection was successfully established

Fill Data Settings for CSV Export
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${fileName}     ${appendResult}
    Input kendo Numeric TextBox     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Select Dropdown By InnerText    ${ddlHeaderFormat}  ${headerFormat}
    Select Dropdown By InnerText  ${ddlSetFormat}  ${setFormat}
    Input kendo Numeric TextBox  ${txtMaxRowsToExport}  ${maxRowstoExport}
    Input Text  ${txtDatastoreFileName}  ${fileName}
    Run Keyword If    '${appendResult}' == 'check'     Select Checkbox  ${ckbAppendResult}
    Run Keyword If    '${appendResult}' == 'uncheck'    Unselect Checkbox  ${ckbAppendResult}

Fill DataStore Format Options
    [Arguments]     ${decimalSeparator}     ${numberofDecimals}     ${timeFormat}       ${timeSeparator}    ${dateFormat}       ${dateSeparator}       ${valueYes}      ${valueNo}      ${enquote}      ${enquoteHeaders}       ${fieldSeparator}       ${lineSeparator}        ${enquoteCharacter}
    Input Text  ${txtDecimalSeparator}  ${decimalSeparator}
    Input kendo Numeric TextBox  ${ddlNumberofDecimals}  ${numberofDecimals}
    Select Dropdown By InnerText  ${ddlTimeFormat}  ${timeFormat}
    Input Text  ${txtTimeSeparator}  ${timeSeparator}
    Select Dropdown By InnerText  ${ddlDateFormater}  ${dateFormat}
    Input Text  ${txtDateSeparator}  ${dateSeparator}
    Input Text  ${txtValueYes}  ${valueYes}
    Input Text  ${txtValueNo}  ${valueNo}
    Select Dropdown By InnerText  ${ddlEnquote}  ${enquote}    
    Run Keyword If    '${enquoteHeaders}' == 'check'     Select Checkbox    ${chkboxEncouteHeader}
    Run Keyword If    '${enquoteHeaders}' == 'uncheck'     Unselect Checkbox    ${chkboxEncouteHeader}
    Input Text  ${txtFieldSeparator}  ${fieldSeparator}
    Select Dropdown By InnerText  ${ddlLineSeparator}  ${lineSeparator}
    Input Text  ${txtEnquoteCharacter}  ${enquoteCharacter}

Click on Save button in DataStore
    [Arguments]     ${datastorePlugin}      ${datastoreName}
    Wait Until Element Exist And Visible  ${btnSaveEditDataStoresGrid}
    Click Element      ${btnSaveEditDataStoresGrid}
    Wait Until Element Exist And Visible  ${dataGridDataStoresGrid}
    Enter Text in Datastore filter page  ${datastoreName}
    Wait Until Element Exist And Visible  //div[@id='DataStoresGridContainer']//tr/td[text()='${datastoreName}']/parent::tr/td[text()='${datastorePlugin}']

Fill Data Settings for Excel Export
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${fileName}     ${templateFileName}     ${sheetName}     ${techInfo}
    Input kendo Numeric TextBox     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Select Dropdown By InnerText    ${ddlHeaderFormat}  ${headerFormat}
    Select Dropdown By InnerText  ${ddlSetFormat}  ${setFormat}
    Input kendo Numeric TextBox  ${txtMaxRowsToExport}  ${maxRowstoExport}
    Input Text  ${txtDatastoreFileName}  ${fileName}
    Select Dropdown By InnerText  ${ddlTemplateFileName}  ${templateFileName}
    Input Text  ${txtDatastoreSheetName}  ${sheetName}
    Run Keyword If    '${techInfo}' == 'check'     Select Checkbox  ${ckbTechInfo}
    Run Keyword If    '${techInfo}' == 'uncheck'     Unselect Checkbox  ${ckbTechInfo}

Fill Angle Settings
    [Arguments]     ${angleSummary}     ${angleDefinition}
    Run Keyword If    '${angleSummary}' == 'check'     Select Checkbox  ${ckbAngleSummary}
    Run Keyword If    '${angleSummary}' == 'uncheck'     Unselect Checkbox  ${ckbAngleSummary}
    Run Keyword If    '${angleDefinition}' == 'check'     Select Checkbox  ${ckbAngleDefinition}
    Run Keyword If    '${angleDefinition}' == 'uncheck'     Unselect Checkbox  ${ckbAngleDefinition}

Fill Data Settings for SQL Export
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${tableName}     ${deletionTimeout}     ${appendResult}
    Input kendo Numeric TextBox     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Select Dropdown By InnerText    ${ddlHeaderFormat}  ${headerFormat}
    Select Dropdown By InnerText  ${ddlSetFormat}  ${setFormat}
    Input kendo Numeric TextBox  ${txtMaxRowsToExport}  ${maxRowstoExport}
    Input Text  ${txtTableName}  ${tableName}
    Input kendo Numeric TextBox     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Run Keyword If    '${appendResult}' == 'check'     Select Checkbox  ${ckbAppendResult}
    Run Keyword If    '${appendResult}' == 'uncheck'     Unselect Checkbox  ${ckbAppendResult}

Fill Connection Settings for SQL Export
    [Arguments]     ${serverName}   ${userName}     ${password}     ${databaseName}     ${integratedSecurity}
    Input Text  ${txtSQLServerName}      ${serverName}
    Input Text  ${txtSQLUsername}      ${userName}
    Input Text  ${txtSQLPassword}      ${password}
    Input Text  ${txtSQLDatabase}      ${databaseName}
    Run Keyword If    '${integratedSecurity}' == 'check'     Select Checkbox  ${ckbIntegratedSecurity}
    Run Keyword If    '${integratedSecurity}' == 'uncheck'     Unselect Checkbox  ${ckbIntegratedSecurity}
    Click Element      ${btnTestConnection}
    Wait Until Ajax Complete
    Element Text Should Be      ${lblStatusInfo}     Invalid connection settings. Either use integrated security or provide username and password but not both.
    Unselect Checkbox  ${ckbIntegratedSecurity}

Enter Text in Datastore filter page
    [Arguments]     ${filterText}
    Input Text      ${txtDatastoreFilter}      ${filterText}
    Wait Until Ajax Complete

Verify the DataStoresGrid is filtered with Text
    [Arguments]     ${filterText}
    @{rowList}  Get Grid Column Texts  ${tblDatastoresGridRows}  1
    ${rowCount}  Get Element Count  ${tblDatastoresGridRows}
    :For    ${index}      IN RANGE    0   ${rowCount-1}
    \       Should Contain      @{rowList}[${index}]    ${filterText}

Click on Edit in action drop down by Datastore name
    [Arguments]    ${name}
    Wait Until Page Contains Element    ${trRowDatastoreGrid}:contains(${name}) ${btnEditAction}
    Scroll Horizontal  ${scrollBarHorizontalGrid}  2000
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowDatastoreGrid}:contains(${name})
    Click Element    ${trRowDatastoreGrid}:contains(${name}) ${btnEditAction}
    Wait Until Login Page Contains Text     Edit datastore

Verify the field values for Datastore Name
    [Arguments]     ${datastoreName}     ${defaultDataStore}
    Textfield value should be  ${txtDatastoreName}    ${datastoreName}
    Run Keyword If    '${defaultDataStore}' == 'check'     Checkbox should be selected  ${chkboxDefaultDataStore}
    Run Keyword If    '${defaultDataStore}' == 'uncheck'     Checkbox should not be selected  ${chkboxDefaultDataStore}

Verify the field values for CSV and Excel Datastore in Connection Settings
    [Arguments]     ${outputFolder}
    Textfield value should be   ${txtOutputFolder}      ${outputFolder}

Verify the field values for CSV Datastore in Data Settings
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${fileName}     ${appendResult}
    Textfield value should be     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Textfield value should be    ${ddlHeaderFormat}  ${headerFormat}
    Textfield value should be  ${ddlSetFormat}  ${setFormat}
    Textfield value should be  ${txtMaxRowsToExport}  ${maxRowstoExport}
    Textfield value should be  ${txtDatastoreFileName}  ${fileName}
    Run Keyword If    '${appendResult}' == 'check'     Checkbox should be selected  ${ckbAppendResult}
    Run Keyword If    '${appendResult}' == 'uncheck'     Checkbox should not be selected  ${ckbAppendResult}

Verify the field values for CSV Datastore in Format Settings
    [Arguments]     ${decimalSeparator}     ${numberofDecimals}     ${timeFormat}       ${timeSeparator}    ${dateFormat}       ${dateSeparator}       ${valueYes}      ${valueNo}      ${enquote}      ${enquoteHeaders}       ${fieldSeparator}       ${lineSeparator}        ${enquoteCharacter}
    Textfield value should be  ${txtDecimalSeparator}  ${decimalSeparator}
    Textfield value should be  ${ddlNumberofDecimals}  ${numberofDecimals}
    Textfield value should be  ${ddlTimeFormat}  ${timeFormat}
    Textfield value should be  ${txtTimeSeparator}  ${timeSeparator}
    Textfield value should be  ${ddlDateFormater}  ${dateFormat}
    Textfield value should be  ${txtDateSeparator}  ${dateSeparator}
    Textfield value should be  ${txtValueYes}  ${valueYes}
    Textfield value should be  ${txtValueNo}  ${valueNo}
    Textfield value should be  ${ddlEnquote}  ${enquote}    
    Run Keyword If    '${enquoteHeaders}' == 'check'     Checkbox should be selected    ${chkboxEncouteHeader}
    Run Keyword If    '${enquoteHeaders}' == 'uncheck'     Checkbox should not be selected  ${chkboxEncouteHeader}
    Textfield value should be  ${txtFieldSeparator}  ${fieldSeparator}
    Textfield value should be  ${ddlLineSeparator}  ${lineSeparator}
    Textfield value should be  ${txtEnquoteCharacter}  ${enquoteCharacter}

Click on Delete in action drop down by Datastore name and Delete Datastore
    [Arguments]    ${name}
    Click Show Action Dropdown In Grid By Name   ${name}     ${trRowDatastoreGrid}
    Click Action In Grid By Name    ${name}     ${trRowDatastoreGrid}   ${btnDeleteAction}
    Wait Until Login Page Contains Text     Delete Data Store:
    Click Element   ${btnDeleteDatastore}

Verify the datastore is not available in Datastore Grid
    [Arguments]     ${datastorePlugin}      ${datastoreName}
    Sleep   10s
    Enter Text in Datastore filter page  ${datastoreName}
    Element Should Not Be Visible   //div[@id='DataStoresGridContainer']//tr/td[text()='${datastoreName}']/parent::tr/td[text()='${datastorePlugin}']

Verify the field values for Excel Datastore in Data Settings
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${fileName}     ${templateFileName}     ${sheetName}     ${techInfo}
    Textfield value should be     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Textfield value should be    ${ddlHeaderFormat}  ${headerFormat}
    Textfield value should be  ${ddlSetFormat}  ${setFormat}
    Textfield value should be  ${txtMaxRowsToExport}  ${maxRowstoExport}
    Textfield value should be  ${txtDatastoreFileName}  ${fileName}
    Textfield value should be  ${ddlTemplateFileName}  ${templateFileName}
    Textfield value should be  ${txtDatastoreSheetName}  ${sheetName}
    Run Keyword If    '${techInfo}' == 'check'     Checkbox should be selected  ${ckbTechInfo}
    Run Keyword If    '${techInfo}' == 'uncheck'     Checkbox should not be selected  ${ckbTechInfo}

Verify the field values for Excel Datastore in Angle Settings
    [Arguments]     ${angleSummary}     ${angleDefinition}
    Run Keyword If    '${angleSummary}' == 'check'     Checkbox should be selected  ${ckbAngleSummary}
    Run Keyword If    '${angleSummary}' == 'uncheck'     Checkbox should not be selected  ${ckbAngleSummary}
    Run Keyword If    '${angleDefinition}' == 'check'     Checkbox should be selected  ${ckbAngleDefinition}
    Run Keyword If    '${angleDefinition}' == 'uncheck'     Checkbox should not be selected  ${ckbAngleDefinition}

Verify the field values for SQL Datastore in Connection Settings
    [Arguments]     ${serverName}   ${userName}     ${password}     ${databaseName}     ${integratedSecurity}
    Textfield value should be  ${txtSQLServerName}      ${serverName}
    Textfield value should be  ${txtSQLUsername}      ${userName}
    #Textfield value should be  ${txtSQLPassword}      ${password}
    Input Text  ${txtSQLPassword}      ${password}
    Textfield value should be  ${txtSQLDatabase}      ${databaseName}
    Run Keyword If    '${integratedSecurity}' == 'check'     Checkbox should be selected  ${ckbIntegratedSecurity}
    Run Keyword If    '${integratedSecurity}' == 'uncheck'     Checkbox should not be selected  ${ckbIntegratedSecurity}

Verify the field values for SQL Datastore in Data Settings
    [Arguments]     ${modalTimeStampIndex}      ${headerFormat}     ${setFormat}       ${maxRowstoExport}       ${tableName}     ${deletionTimeout}     ${appendResult}
    Textfield value should be     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Textfield value should be    ${ddlHeaderFormat}  ${headerFormat}
    Textfield value should be   ${ddlSetFormat}  ${setFormat}
    Textfield value should be   ${txtMaxRowsToExport}  ${maxRowstoExport}
    Textfield value should be   ${txtTableName}  ${tableName}
    Textfield value should be     ${txtModelTimestampIndex}   ${modalTimeStampIndex}
    Run Keyword If    '${appendResult}' == 'check'     Checkbox should be selected  ${ckbAppendResult}
    Run Keyword If    '${appendResult}' == 'uncheck'     Checkbox should not be selected  ${ckbAppendResult}