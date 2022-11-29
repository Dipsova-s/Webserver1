*** Variables ***
${divChartWrapper}              jquery=#ChartWrapper
${pgbChartDisplay}              jquery=#ChartWrapper .k-loading-mask
${svgChart}                     jquery=#ChartWrapper svg
${svgFirstBarColumnChart}       jquery=#chart > svg > g > g:nth-child(3) > g:nth-child(5) > g > g:nth-child(1)
${svgFirstBarCircle}            jquery=#chart > svg > g > g:nth-child(3) > g:nth-child(5) > g > circle
${divChartTooltip}              .k-chart-tooltip
${liSecondLegend}               jquery=.k-legend-custom li[data-index="1"]
${divNavigatorWrapper}          css=#ChartWrapper .navigatorWrapper
${btnNavigator}                 css=#ChartWrapper .toggleButton
${btnColorPickerCancel}         css=.k-coloreditor-cancel
${divColorPicker}               css=.k-flatcolorpicker
${btnClearAllRefLine}           xpath=//span[text()='Clear all']/../../a[@id='btn-popupReferenceLine1']
${InputFieldFrom}               xpath=(//div[text()='From']/..//input[contains(@class,'k-input')])[1]
${FromLabel}                    xpath=//div[text()='From']
${InputFieldTo}                 xpath=(//div[text()='To']/..//input[contains(@class,'k-input')])[1]
${TOLabel}                      xpath=//div[@id='ReferenceLabel']
${UnitSelectorTO}               xpath=//div[text()='To']/..//span[@class='k-widget k-dropdown k-periodpicker-control']
${UnitSelectorValueOfTO}        xpath=//div[text()='To']/..//span[@class='k-input']
${UnitSelectorValueOfFROM}      xpath=//div[text()='From']/..//span[@class='k-input']

${ColorLocator}                 xpath=//div[text()='Color']/../../..//div[@id='ReferenceLabel']
${OpacityLocator}               xpath=//div[text()='Opacity']/../../..//div[@id='ReferenceLabel']
${Colordropdown}                xpath=//div[text()='Color']/..//span[@class='k-icon k-i-arrow-s k-i-arrow-60-down icon icon-caret-down']
${LocatorColorInColorSelector}  xpath=//span[@class='k-selected-color']
${InputFieldOpacity}            xpath=//div[text()='Opacity']/..//input[@class='k-formatted-value eaText k-input']
*** Keywords ***
Wait Until Chart Display Loaded
    Wait Until Field Settings Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divChartWrapper}
    ${isExecute}  Is Angle Executed
    Run Keyword If    ${isExecute} == ${True}        Wait Until Page Contains Element    ${svgChart}    
    Wait Until Page Does Not Contain Element    ${pgbChartDisplay}    
    Wait Until Ajax Complete

Click First Bar In Column Chart
    Click Element    ${svgFirstBarColumnChart}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Click First Bar In Column Chart Circle
    Click Element    ${svgFirstBarCircle}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Get Total Of First Bar In Column Chart
    Mouse Over    ${svgFirstBarColumnChart}
    Wait Until Page Contains Element    css=${divChartTooltip}
    ${tooltipText} =    Execute Javascript    return $('${divChartTooltip}').text()
    ${total} =    Execute Javascript    return parseInt('${tooltipText}'.substr('${tooltipText}'.lastIndexOf(': ')+2))
    [Return]    ${total}

Click Second Legend In Chart
    Click Element    ${liSecondLegend}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Get Expect Filter Of Second Legend
    ${filterValue}    Get Element Attribute    ${liSecondLegend}  title
    ${expectFilter}    Execute Javascript    return "is equal to ${filterValue}"
    [Return]    ${expectFilter}

Open Chart Navigator
    ${isClosed}    Is Element Has CssClass   ${divNavigatorWrapper}   hidden
    Run Keyword If   ${isClosed} == True   Click Element   ${btnNavigator}
    Sleep   ${TIMEOUT_GENERAL}

Close Chart Navigator
    ${isClosed}    Is Element Has CssClass   ${divNavigatorWrapper}   hidden
    Run Keyword If   ${isClosed} == False   Click Element   ${btnNavigator}
    Sleep   ${TIMEOUT_GENERAL}

Enter Numbers in FROM text field
    [Arguments]  ${Numbers}
    # If value exist, delete the value
    ${ValueInFrom}=  Get value  ${InputFieldFrom}
    Run Keyword if   "${ValueInFrom}"!=""   Run keywords  Press Keys  	${InputFieldFrom}   CTRL+a+DELETE  AND  Custom click element   ${FromLabel}
    Input Text    ${InputFieldFrom}    ${Numbers}
    Custom click element   ${FromLabel}  

Enter Numbers in TO text field 
    [Arguments]  ${Numbers}
    # If value exist, delete the value
    ${ValueInTo}=  Get value  ${InputFieldTo}
    Run Keyword if   "${ValueInTo}"!=""    Run keywords  Press Keys  	${InputFieldTo}   CTRL+a+DELETE  AND  Custom click element   ${FromLabel}
    Input Text    ${InputFieldTo}    ${Numbers}
    Custom click element   ${FromLabel}

Click on 'Clear all' Button 
    Wait Until Element Is Enabled  ${btnClearAllRefLine}  timeout=50s  error='Clear all' Button is not Enabled
    Custom click element  ${btnClearAllRefLine}

Validate "From" input values are cleared
    ${ValueInFrom}=  Get value  ${InputFieldFrom}
    Run Keyword if   "${ValueInFrom}"==""  Log   "From" input values are cleared
    ...   ELSE  Fail  "From" input values are not cleared

Validate "To" input values are cleared
    ${ValueInTo}=  Get value  ${InputFieldTo}
    Run Keyword if  "${ValueInTo}"==""  Log   "To" input values are cleared
    ...   ELSE  Fail  "To" input values are not cleared

Validate "To" input field is disabled
    Element Should Be Disabled  ${InputFieldTo}
    # Validate "To" label and unit selector(if present) is disabled 
    ${classValue}=  Get element Attribute   ${TOLabel}  class
    Should Contain  ${classValue}  disabled

Validate TO unit selector(if present) reset back to the default unit
    ${PassOrFail}=  Run Keyword And Return Status  Page Should Contain Element   ${UnitSelectorTO} 
    Run Keyword if   '${PassOrFail}'=='True'  Run keywords   
    ...   Element Should Contain  ${UnitSelectorValueOfTO}  Day(s)  message=In TO field, Default unit is not reset back to Day(s) 
    ...   AND   Element Should Contain  ${UnitSelectorValueOfFROM}  Day(s)  message=In FROM field, Default unit is not reset back to Day(s)
    
Validate Clear All button is disabled
    ${classValue}=  Get element Attribute   ${btnClearAllRefLine}  class
    Should Contain  ${classValue}  disabled
    
Validate Color selector and Opacity input field is enabled
    Wait Until Ajax Complete
    # check Color selector is enabled
    ${Enabled or not}=  Get Element Attribute  ${ColorLocator}  class
    Run keyword if   '${Enabled or not}'==''  log  Color selector is enabled
    ...   ELSE   Fail    Color selector is NOT enabled
    # check Opacity input field is enabled
    ${Enabled or not}=  Get Element Attribute  ${OpacityLocator}  class
    Run keyword if   '${Enabled or not}'==''  log  Opacity input field is enabled
    ...   ELSE   Fail    Opacity input field is NOT enabled

Validate Color selector and Opacity input field is disabled 
    Wait Until Ajax Complete
    # check Color selector is disabled
    ${Enabled or not}=  Get Element Attribute  ${ColorLocator}  class
    Should Contain   ${Enabled or not}   disabled   msg=Color selector is NOT disabled
    
    # check Opacity input field is disabled
    ${Enabled or not}=  Get Element Attribute  ${OpacityLocator}  class
    Should Contain   ${Enabled or not}   disabled   msg=Opacity input field is NOT disabled

Select Color in Color selector  
    [Arguments]   ${Colorcode}
    # ${Colorcode} should be in format ex:  rgb(63, 72, 204)
    Custom click element   ${Colordropdown}
    sleep  1s   
    Set Global Variable  ${Colorcode}  ${Colorcode}   
    # select  color
    Custom click element  xpath=//td[contains(@style,'${Colorcode}')]
       
Validate selected color appears in Color selector
    sleep  1s
    ${ColorInColorSelector}=  Get Element Attribute  ${LocatorColorInColorSelector}  style
    Should Contain   ${ColorInColorSelector}   ${Colorcode}  msg=Selected color ${Colorcode} did NOT appear in Color selector
    Click Element   ${btnColorPickerCancel}
    Wait Until Element Is Not Visible    ${divColorPicker}  
    
Validate default color should be black
    ${dColorInColorSelector}=  Get Element Attribute  ${LocatorColorInColorSelector}  style
    Should Contain   ${dColorInColorSelector}   rgb(0, 0, 0)  msg=Default color is NOT black


Validate default Opacity should be 75%
    ${ValueInOpacity}=  Get value  ${InputFieldOpacity}
    Run keyword if  '${ValueInOpacity}'=='75 %'  Log   Default Opacity is 75%
    ...  ELSE  Fail  Default Opacity is shown as ${ValueInOpacity}