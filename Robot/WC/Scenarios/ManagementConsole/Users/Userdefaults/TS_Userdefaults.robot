*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/UserDefaults.robot

*** Keywords ***
Go To User defaults Page With Admin User
    Go to MC Then Login With Admin User
    Go to User Defaults page in MC

Fill all the User defaults fields
    Select the Decimal Separator drop down Value    ,
    Select the Thousands Separator drop down value      .
    Select the Date Order drop down value       Year Month Day
    Select the Day Format drop down value       d (9)
    Select the Month Format drop down value     MM (08)
    Select the Year Format drop down value      yy (15)
    Select the Date Separator drop down value       .
    Select the Time Format drop down value      h:mm (am/pm)
    Select the Time Separator drop down value       .
    Select the Default Setting for language drop down value     German
    Select the Default setting for currency drop down value     US Dollar
    Select the Number format options value      4 decimals      Millions (M)    False
    Select the Currencies format options value      5 decimals      Thousands (K)   False
    Select the Percentages format options value     6 decimals      Millions (M)    False
    Select the Default settings for export lines drop down value        10000 results
    Select the SAP fields chooser option check box      False
    Select the SAP fields in header option check box        False
    Select the By default selected field option check box       False   False
    Select the Compressed list header option check box      False
    Select the Default setting for Business Processes check box     True   True   True   True   True   True   True   True   True
    Select the Auto execute items on login check box    False
    Select the Default settings for set option drop down value      Short name (Long name)

Click on Save in User defaults
    Save User Defaults

Verify the field values in User defaults page
    ${returnText}   Get the Decimal Separator drop down selected Value
    Should Be Equal     ,   ${returnText}
    ${returnText}   Get the Thousands Separator drop down selected value
    Should Be Equal     .   ${returnText}
    ${returnText}   Get the Date Order drop down selected value
    Should Be Equal     Year Month Day  ${returnText}    
    ${returnText}   Get the Day Format drop down selected value
    ${expectedValue}    Set Variable    d (9)
    Should Be Equal     ${expectedValue}   ${returnText}
    ${returnText}   Get the Month Format drop down selected value
    ${expectedValue}    Set Variable    MM (08)
    Should Be Equal     ${expectedValue}    ${returnText} 
    ${returnText}   Get the Year Format drop down selected value
    ${expectedValue}    Set Variable    yy (15)
    Should Be Equal     ${expectedValue}    ${returnText}
    ${returnText}   Get the Date Separator drop down selected value
    Should Be Equal     .   ${returnText}
    ${returnText}   Get the Time Format drop down selected value
    ${expectedValue}    Set Variable    h:mm (am/pm)
    Should Be Equal     ${expectedValue}    ${returnText}
    ${returnText}   Get the Time Separator drop down selected value
    Should Be Equal     .   ${returnText}
    ${returnText}   Get the Default Setting for language drop down selected value
    Should Be Equal     German  ${returnText}
    ${returnText}   Get the Default setting for currency drop down selected value
    ${expectedValue}    Set Variable    US Dollar
    Should Be Equal     ${expectedValue}   ${returnText}
    
    ${numberFormat}     ${numberFormatPrefix}   ${numberFormatThousandSeparator}    Get the Number format options selected value
    ${expectedValue}    Set Variable    4 decimals
    Should Be Equal     ${expectedValue}    ${numberFormat}
    ${expectedValue}    Set Variable    Millions (M)
    Should Be Equal     ${expectedValue}      ${numberFormatPrefix}
    Should Not Be True      ${numberFormatThousandSeparator}

    ${currenciesFormat}     ${currenciesFormatPrefix}   ${currenciesFormatThousandSeparator}    Get the Currencies format options selected value
    ${expectedValue}    Set Variable    5 decimals
    Should Be Equal     ${expectedValue}    ${currenciesFormat}
    ${expectedValue}    Set Variable    Thousands (K)
    Should Be Equal     ${expectedValue}      ${currenciesFormatPrefix}
    Should Not Be True      ${currenciesFormatThousandSeparator}

    ${percentagesFormat}     ${percentagesFormatPrefix}   ${percentagesFormatThousandSeparator}    Get the Percentages format options selected value
    ${expectedValue}    Set Variable    6 decimals
    Should Be Equal     ${expectedValue}    ${percentagesFormat}
    ${expectedValue}    Set Variable    Millions (M)
    Should Be Equal     ${expectedValue}      ${percentagesFormatPrefix}
    Should Not Be True      ${percentagesFormatThousandSeparator}

    ${returnText}   Get the Default settings for export lines drop down selected value
    ${expectedValue}    Set Variable    10000 results
    Should Be Equal     ${expectedValue}   ${returnText}

    ${returnText}   Get the SAP fields chooser option selected value
    Should Not Be True      ${returnText}

    ${returnText}   Get the SAP fields in header option selected value
    Should Not Be True      ${returnText}

    ${returnText}   ${returnText1}   Get the By default selected field option selected value
    Should Not Be True      ${returnText}
    Should Not Be True      ${returnText1}

    ${returnText}   Get the Compressed list header option selected value
    Should Not Be True      ${returnText}

    ${returnText}    ${returnText1}   ${returnText2}   ${returnText3}   ${returnText4}   ${returnText5}   ${returnText6}   ${returnText7}   ${returnText8}   Get the Default setting for Business Processes selected value
    Should Be True      ${returnText}
    Should Be True      ${returnText1}
    Should Be True      ${returnText2}
    Should Be True      ${returnText3}
    Should Be True      ${returnText4}
    Should Be True      ${returnText5}
    Should Be True      ${returnText6}
    Should Be True      ${returnText7}
    Should Be True      ${returnText8}
    
    ${returnText}   Get the Auto execute items on login option selected value
    Should Not Be True      ${returnText}

    ${returnText}   Get the Default settings for set option selected value
    ${expectedValue}    Set Variable    Short name (Long name)
    Should Be Equal     ${expectedValue}   ${returnText}

Get User defaults and store
    ${value}   Get the Decimal Separator drop down selected Value
    Set Test Variable  ${dpdDecimalSeparatorValue}  ${value}
    ${value}   Get the Thousands Separator drop down selected value
    Set Test Variable  ${dpdThousandsSeparatorValue}  ${value}
    ${value}   Get the Date Order drop down selected value
    Set Test Variable  ${dpdDateOrderValue}  ${value}
    ${value}   Get the Day Format drop down selected value
    Set Test Variable  ${dpdDayFormatValue}  ${value}
    ${value}   Get the Month Format drop down selected value
    Set Test Variable  ${dpdMonthFormatValue}  ${value}
    ${value}   Get the Year Format drop down selected value
    Set Test Variable  ${dpdYearFormatValue}  ${value}
    ${value}   Get the Date Separator drop down selected value
    Set Test Variable  ${dpdDateSeparatorValue}  ${value}
    ${value}   Get the Time Format drop down selected value
    Set Test Variable  ${dpdTimeFormatValue}  ${value}
    ${value}   Get the Time Separator drop down selected value
    Set Test Variable  ${dpdTimeSeparatorValue}  ${value}
    ${value}   Get the Default Setting for language drop down selected value
    Set Test Variable  ${dpdDefaultLanguageValue}  ${value}
    ${value}   Get the Default setting for currency drop down selected value
    Set Test Variable  ${dpdDefaultCurrencyValue}  ${value}
    
    ${value1}     ${value2}   ${value3}    Get the Number format options selected value
    Set Test Variable   ${dpdNumbersFormatValue}     ${value1}
    Set Test Variable   ${dpdNumbersFormatPrefixValue}     ${value2}
    Set Test Variable   ${chbNumbersThousandSeparatorValue}     ${value3}
    ${value1}     ${value2}   ${value3}    Get the Currencies format options selected value
    Set Test Variable   ${dpdCurrenciesFormatValue}  ${value1}
    Set Test Variable   ${dpdCurrenciesFormatPrefixValue}  ${value2}
    Set Test Variable   ${chbCurrenciesThousandSeparatorValue}  ${value3}
    ${value1}     ${value2}   ${value3}    Get the Percentages format options selected value
    Set Test Variable   ${dpdPercentageFormatValue}  ${value1}
    Set Test Variable   ${dpdPercentageFormatPrefixValue}  ${value2}
    Set Test Variable   ${chbPercentageThousandSeparatorValue}  ${value3}

    ${value}    Get the Default settings for export lines drop down selected value
    Set Test Variable   ${dpdexportLinesValue}   ${value}
    ${value}       Get the SAP fields chooser option selected value
    Set Test Variable   ${chbSAPChooserValue}   ${value}
    ${value}   Get the SAP fields in header option selected value
    Set Test Variable   ${chbSAPHeaderValue}    ${value}
    ${value1}    ${value2}   Get the By default selected field option selected value
    Set Test Variable   ${chbDefaultStarreddFieldValue}   ${value1}
    Set Test Variable   ${chbDefaultSuggestedFieldValue}   ${value2}
    ${value}   Get the Compressed list header option selected value
    Set Test Variable   ${chbCompressedListHeaderValue}     ${value}

    ${value1}    ${value2}   ${value3}   ${value4}   ${value5}   ${value6}   ${value7}   ${value8}   ${value9}   Get the Default setting for Business Processes selected value
    Set Test Variable   ${chbBPP2PValue}    ${value1}
    Set Test Variable   ${chbBPS2DValue}   ${value2}
    Set Test Variable   ${chbBPO2CValue}   ${value3}
    Set Test Variable   ${chbBPF2RValue}   ${value4}
    Set Test Variable   ${chbBPPMValue}   ${value5}
    Set Test Variable   ${chbBPQMValue}   ${value6}
    Set Test Variable   ${chbBPHCMValue}   ${value7}
    Set Test Variable   ${chbBPGRCValue}   ${value8}
    Set Test Variable   ${chbBPITValue}     ${value9}

    ${value}   Get the Auto execute items on login option selected value
    Set Test Variable   ${chbAutoExecuteItemsValue}     ${value}
    ${value}   Get the Default settings for set option selected value
    Set Test Variable   ${dpdDefaultSettingSetValue}     ${value}

Set User defaults fields and Save the values
    Select the Decimal Separator drop down Value    ${dpdDecimalSeparatorValue}
    Select the Thousands Separator drop down value      ${dpdThousandsSeparatorValue}
    Select the Date Order drop down value       ${dpdDateOrderValue}
    Select the Day Format drop down value       ${dpdDayFormatValue}
    Select the Month Format drop down value     ${dpdMonthFormatValue}
    Select the Year Format drop down value      ${dpdYearFormatValue}
    Select the Date Separator drop down value       ${dpdDateSeparatorValue}
    Select the Time Format drop down value      ${dpdTimeFormatValue}
    Select the Time Separator drop down value       ${dpdTimeSeparatorValue}
    Select the Default Setting for language drop down value     ${dpdDefaultLanguageValue}
    Select the Default setting for currency drop down value     ${dpdDefaultCurrencyValue}
    Select the Number format options value      ${dpdNumbersFormatValue}      ${dpdNumbersFormatPrefixValue}    ${chbNumbersThousandSeparatorValue}
    Select the Currencies format options value      ${dpdCurrenciesFormatValue}      ${dpdCurrenciesFormatPrefixValue}   ${chbCurrenciesThousandSeparatorValue}
    Select the Percentages format options value     ${dpdPercentageFormatValue}      ${dpdPercentageFormatPrefixValue}    ${chbPercentageThousandSeparatorValue}
    Select the Default settings for export lines drop down value        ${dpdexportLinesValue}
    Select the SAP fields chooser option check box      ${chbSAPChooserValue}
    Select the SAP fields in header option check box        ${chbSAPHeaderValue}
    Select the By default selected field option check box       ${chbDefaultStarreddFieldValue}   ${chbDefaultSuggestedFieldValue}
    Select the Compressed list header option check box      ${chbCompressedListHeaderValue}
    Select the Default setting for Business Processes check box     ${chbBPP2PValue}   ${chbBPS2DValue}   ${chbBPO2CValue}   ${chbBPF2RValue}   ${chbBPPMValue}   ${chbBPQMValue}   ${chbBPHCMValue}   ${chbBPGRCValue}   ${chbBPITValue}
    Select the Auto execute items on login check box    ${chbAutoExecuteItemsValue}
    Select the Default settings for set option drop down value      ${dpdDefaultSettingSetValue}
    Click on Save in User defaults