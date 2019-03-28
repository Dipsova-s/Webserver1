*** Keywords ***
Screenshot "WC_How_to_export_to_Excel_or_CSV" page
    ${AngleId}    Set Variable    WEBHELP_WC_Angle_header

    Find Angle By ID Then Execute The First Angle    ${AngleId}
    Click Angle Dropdown To Export Excel
    Update Popup Position    css=.popupExportExcel
    Crop Angle Action Excel
    Click Cancel Excel Button
    
    Click Angle Dropdown To Export CSV
    Update Popup Position    css=.popupExportToCSV
    Crop Angle Action CSV
    

Crop Angle Action Excel
    Crop WebHelp Image     WC_Angle_action_excel2.png     css=.popupExportExcel

Crop Angle Action CSV
    Crop WebHelp Image     WC_Angle_action_CSV2.png      css=.popupExportToCSV

    
