*** Variables ***
${pgbExportToCSV}             css=#popupExportToCSV .k-loading-mask

*** Keywords ***
Wait Until Export To CSV Popup Loaded
    Wait Until Page Does Not Contain Element    ${pgbExportToCSV}
