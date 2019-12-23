*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Users/UserDefaults.robot

*** Variables ***
${dpdDecimalSeparatorValue}
${dpdThousandsSeparatorValue}
${dpdDateOrderValue}
${dpdDayFormatValue}
${dpdMonthFormatValue}
${dpdYearFormatValue}
${dpdDateSeparatorValue}
${dpdTimeFormatValue}
${dpdTimeSeparatorValue}
${dpdDefaultLanguageValue}
${dpdDefaultCurrencyValue}

${dpdNumbersFormatValue}
${dpdNumbersFormatPrefixValue}
${chbNumbersThousandSeparatorValue}
${dpdCurrenciesFormatValue}
${dpdCurrenciesFormatPrefixValue}
${chbCurrenciesThousandSeparatorValue}
${dpdPercentageFormatValue}
${dpdPercentageFormatPrefixValue}
${chbPercentageThousandSeparatorValue}

${dpdexportLinesValue}
${chbSAPChooserValue}
${chbSAPHeaderValue}
${chbDefaultStarreddFieldValue}
${chbDefaultSuggestedFieldValue}
${chbCompressedListHeaderValue}

${chbBPP2PValue}
${chbBPS2DValue}
${chbBPO2CValue}
${chbBPF2RValue}
${chbBPPMValue}
${chbBPHCMValue}
${chbBPGRCValue}
${chbBPITValue}

${chbAutoExecuteItemsValue}
${dpdDefaultSettingSetValue}

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
    Select the Default setting for Business Processes check box     True   True   True   True   True   True   True   True
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

    ${returnText}    ${returnText1}   ${returnText2}   ${returnText3}   ${returnText4}   ${returnText5}   ${returnText6}   ${returnText7}   Get the Default setting for Business Processes selected value
    Should Be True      ${returnText}
    Should Be True      ${returnText1}
    Should Be True      ${returnText2}
    Should Be True      ${returnText3}
    Should Be True      ${returnText4}
    Should Be True      ${returnText5}
    Should Be True      ${returnText6}
    Should Be True      ${returnText7}
    
    ${returnText}   Get the Auto execute items on login option selected value
    Should Not Be True      ${returnText}

    ${returnText}   Get the Default settings for set option selected value
    ${expectedValue}    Set Variable    Short name (Long name)
    Should Be Equal     ${expectedValue}   ${returnText}

Get User defaults and store
    ${dpdDecimalSeparatorValue}   Get the Decimal Separator drop down selected Value
    ${dpdThousandsSeparatorValue}   Get the Thousands Separator drop down selected value
    ${dpdDateOrderValue}   Get the Date Order drop down selected value
    ${dpdDayFormatValue}   Get the Day Format drop down selected value
    ${dpdMonthFormatValue}   Get the Month Format drop down selected value
    ${dpdYearFormatValue}   Get the Year Format drop down selected value
    ${dpdDateSeparatorValue}   Get the Date Separator drop down selected value
    ${dpdTimeFormatValue}   Get the Time Format drop down selected value
    ${dpdTimeSeparatorValue}   Get the Time Separator drop down selected value
    ${dpdDefaultLanguageValue}   Get the Default Setting for language drop down selected value
    ${dpdDefaultCurrencyValue}   Get the Default setting for currency drop down selected value
    
    ${dpdNumbersFormatValue}     ${dpdNumbersFormatPrefixValue}   ${value}    Get the Number format options selected value
    Set Test Variable   ${chbNumbersThousandSeparatorValue}     ${value}
    ${dpdCurrenciesFormatValue}     ${dpdCurrenciesFormatPrefixValue}   ${value}    Get the Currencies format options selected value
    Set Test Variable   ${chbCurrenciesThousandSeparatorValue}  ${value}
    ${dpdPercentageFormatValue}     ${dpdPercentageFormatPrefixValue}   ${value}    Get the Percentages format options selected value
    Set Test Variable   ${chbPercentageThousandSeparatorValue}  ${value}

    ${value}    Get the Default settings for export lines drop down selected value
    Set Test Variable   ${dpdexportLinesValue}   ${value}
    ${value}       Get the SAP fields chooser option selected value
    Set Test Variable   ${chbSAPChooserValue}   ${value}
    ${value}   Get the SAP fields in header option selected value
    Set Test Variable   ${chbSAPHeaderValue}    ${value}
    ${value}    ${value1}   Get the By default selected field option selected value
    Set Test Variable   ${chbDefaultStarreddFieldValue}   ${value}
    Set Test Variable   ${chbDefaultSuggestedFieldValue}   ${value1}
    ${value}   Get the Compressed list header option selected value
    Set Test Variable   ${chbCompressedListHeaderValue}     ${value}

    ${value}    ${value1}   ${value2}   ${value3}   ${value4}   ${value5}   ${value6}   ${value7}   Get the Default setting for Business Processes selected value
    Set Test Variable   ${chbBPP2PValue}    ${value}
    Set Test Variable   ${chbBPS2DValue}   ${value1}
    Set Test Variable   ${chbBPO2CValue}   ${value2}
    Set Test Variable   ${chbBPF2RValue}   ${value3}
    Set Test Variable   ${chbBPPMValue}   ${value4}
    Set Test Variable   ${chbBPHCMValue}   ${value5}
    Set Test Variable   ${chbBPGRCValue}   ${value6}
    Set Test Variable   ${chbBPITValue}     ${value7}

    ${value}   Get the Auto execute items on login option selected value
    Set Test Variable   ${chbAutoExecuteItemsValue}     ${value}
    ${dpdDefaultSettingSetValue}   Get the Default settings for set option selected value

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
    Select the Default setting for Business Processes check box     ${chbBPP2PValue}   ${chbBPS2DValue}   ${chbBPO2CValue}   ${chbBPF2RValue}   ${chbBPPMValue}   ${chbBPHCMValue}   ${chbBPGRCValue}   ${chbBPITValue}
    Select the Auto execute items on login check box    ${chbAutoExecuteItemsValue}
    Select the Default settings for set option drop down value      ${dpdDefaultSettingSetValue}
    Click on Save in User defaults