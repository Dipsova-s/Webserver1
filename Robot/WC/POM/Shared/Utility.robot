*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/Breadcrumb.robot
Resource            ${EXECDIR}/WC/POM/Shared/ToastNotification.robot
Resource            ${EXECDIR}/WC/POM/Shared/HelpText.robot

*** Variables ***
${pgbMain}              css=#popupProgressBar
${btnBackToSearch}      BackToSearch
${htmlInitialized}      css=html.initialized
${pgbMC}                css=#loading
${pgbMCMainContent}     css=.loadingMainContent
${popupError}           css=#popupNotification .notificationIcon.error
${btnErrorMore}         jquery=#popupNotification .more

*** Keywords ***
Wait Until Page Initialized
    Wait Until Page Contains Element    ${htmlInitialized}    60s

Wait Until Element Exist And Visible
    [Arguments]    ${element}
    Wait Until Page Contains Element    ${element}
    Wait Until Element Is Visible    ${element}

Check Web Error
    Sleep    ${TIMEOUT_GENERAL}
    ${isErrorShown}    Is Element Visible    ${popupError}
    Run Keyword If    ${isErrorShown} == True    Show Web Error Details
    Run Keyword If    ${isErrorShown} == True    Capture Page Screenshot
    Run Keyword If    ${isErrorShown} == True    Fail

Show Web Error Details
    ${hasErrorMore}    Is Element Visible    ${btnErrorMore}
    Run Keyword If    ${hasErrorMore} == True    Click Element    ${btnErrorMore}

Check And Wait Until Element Is Not Visible
    [Arguments]    ${element}    ${timeout}=30s
    ${isVisible}    Is Element Visible    ${element}
    Run Keyword If    ${isVisible} == True    Wait Until Element Is Not Visible    ${element}    ${timeout}

Wait Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Check And Wait Until Element Is Not Visible    ${pgbMain}

Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Check And Wait Until Element Is Not Visible    ${pgbMC}    ${TIMEOUT_MC_PROGRESS_BAR}
    Check And Wait Until Element Is Not Visible    ${pgbMCMainContent}    60s

Wait Until JavaScript Is True
    [Arguments]  ${script}
    : FOR    ${INDEX}    IN RANGE    0    ${TIMEOUT_AJAX_COMPLETE}
    \    ${result}    Execute JavaScript    return ${script}
    \    Exit For Loop If    ${result} == True

Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until JavaScript Is True    window.jQuery && window.jQuery.active<1
    Execute Javascript    window.jQuery.active=0

Get Page Title
    ${title}    Get Title
    ${title}    Replace String    ${title}    '    ${EMPTY}
    ${title}    Replace String    ${title}    "    ${EMPTY}
    [Return]   ${title}

Get JQuery Selector
    [Arguments]  ${selector}
    ${jquerySelector}    Execute Javascript    return '${selector}'.indexOf('=') == -1 ? '#${selector}' : '${selector}'.substr('${selector}'.indexOf('=') + 1)
    [Return]    ${jquerySelector}

Get Number From Element Text
    [Arguments]    ${element}
    ${jquerySelector}    Get JQuery Selector    ${element}
    ${number}    Execute Javascript    return parseFloat($('${jquerySelector}').text().replace(/,/g,''))
    [Return]    ${number}

Get Zoomed Element Size
    [Arguments]    ${element}    ${zoom}
    ${width}    ${height}    Get Element Size    ${element}
    ${newWidth}    Execute JavaScript    return ${width}*${zoom};
    ${newHeight}    Execute JavaScript    return ${height}*${zoom};
    [Return]    ${newWidth}    ${newHeight}

Get Element Offset
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${left}    ${top}    Execute Javascript    var offset=$('${jquerySelector}').offset();return [offset.left, offset.top];
    [Return]    ${left}    ${top}

Get Element Index
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${index}    Execute Javascript    return $('${jquerySelector}').index()
    [Return]    ${index}

Get Element Html
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${html}    Execute Javascript    return $('${jquerySelector}').html()
    [Return]    ${html}

Is Element Visible
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').is(':visible')
    [Return]    ${status}

Is Element Checked
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').is(':checked')
    [Return]    ${status}

Is Element Has CssClass
    [Arguments]  ${selector}    ${className}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${status}    Execute Javascript    return $('${jquerySelector}').hasClass('${className}')
    [Return]    ${status}

Input Text By JQuery
    [Arguments]  ${selector}    ${text}
    ${jquerySelector} =    Get JQuery Selector    ${selector}
    Execute Javascript    $('${jquerySelector}').val('${text}')

Input kendo Percentage TextBox
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoPercentageTextBox').value(${valueText})
    Execute Javascript     jQuery("#${elementId}").data('kendoPercentageTextBox').trigger('change')

Input kendo Numeric TextBox
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoNumericTextBox').value(${valueText})
    Execute Javascript     jQuery("#${elementId}").data('kendoNumericTextBox').trigger('change')

Input kendo Date Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoDatePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoDatePicker').trigger('change')

Input kendo Datetime Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoDateTimePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoDateTimePicker').trigger('change')

Input kendo Time Picker
    [Arguments]  ${elementId}    ${valueText}
    Execute Javascript     jQuery("#${elementId}").data('kendoTimePicker').value('${valueText}')
    Execute Javascript     jQuery("#${elementId}").data('kendoTimePicker').trigger('change')

Input kendo Text Editor
    [Arguments]  ${elementId}    ${valueText}
    ${jquerySelector}    Get JQuery Selector    ${elementId}
    Execute Javascript     jQuery("${jquerySelector}").data('kendoEditor').value('${valueText}')
    Execute Javascript     jQuery("${jquerySelector}").data('kendoEditor').trigger('change')

Select Dropdown By Kendo
    [Arguments]  ${elementId}    ${value}
    Execute Javascript     jQuery("#${elementId}").data('kendoDropDownList').value('${value}')
    Execute Javascript     jQuery("#${elementId}").data('kendoDropDownList').trigger('change')

Select Dropdown By Selector
    [Arguments]  ${selectElement}    ${selectItem}
    Click Element    ${selectElement}
    Sleep            ${TIMEOUT_DROPDOWN}
    ${jquerySelector}    Get JQuery Selector    ${selectItem}
    Execute Javascript    $('${jquerySelector}').parents('ul:first').scrollTop($('${jquerySelector}').parent().position().top)
    Sleep            ${TIMEOUT_DROPDOWN}
    Click Element    ${selectItem}
    ${isDropdownVisible}    Is Element Visible    ${selectItem}
    Run Keyword If    ${isDropdownVisible} == True    Wait Until Dropdown Disappears    ${selectItem}

Wait Until Dropdown Disappears
    [Arguments]  ${selectItem}
    ${selectItemText}    Convert To String    ${selectItem}
    ${text}    Get Substring    ${selectItemText}    -8
    ${visibleItem}    Set Variable If    "${text}" == ":visible"    ${selectItem}    ${selectItem}:visible
    Wait Until Page Does Not Contain Element    ${visibleItem}

Select Dropdown By Text
    [Arguments]  ${selectElement}    ${text}
    Select Dropdown By Selector    ${selectElement}   jquery=span[title="${text}"]:visible

Select Dropdown By InnerText
    [Arguments]  ${selectElement}    ${text}
    Select Dropdown By Selector    ${selectElement}   jquery=.k-item:contains("${text}"):visible

Scroll Horizontal
    [Arguments]  ${element}    ${scrollLeft}
    ${jquerySelector}    Get JQuery Selector    ${element}
    Execute Javascript     $('${jquerySelector}').scrollLeft(${scrollLeft})
    Sleep    ${TIMEOUT_GENERAL}

Scroll Horizontal To Element
    [Arguments]  ${scrollableElement}    ${scrolltoElement}
    ${jquerySelector}    Get JQuery Selector    ${scrolltoElement}
    ${scrollLeft}    Execute Javascript    return $('${jquerySelector}').position().left
    Scroll Horizontal    ${scrollableElement}    ${scrollLeft}

Scroll Vertical
    [Arguments]  ${element}    ${scrollTop}
    ${jquerySelector}    Get JQuery Selector    ${element}
    Execute Javascript     $('${jquerySelector}').scrollTop(${scrollTop})
    Sleep    ${TIMEOUT_GENERAL}

Scroll Vertical To Element
    [Arguments]  ${scrollableElement}    ${scrolltoElement}
    ${jquerySelector}    Get JQuery Selector    ${scrolltoElement}
    ${scrollTop}    Execute Javascript    return $('${jquerySelector}').position().top
    Scroll Vertical    ${scrollableElement}    ${scrollTop}

Scroll Grid Horizontal
    [Arguments]  ${gridId}    ${scrollLeft}
    Sleep    ${TIMEOUT_GENERAL}
    Execute Javascript     $("#${gridId} .k-virtual-scrollable-wrap").scrollLeft(${scrollLeft})
    Sleep    ${TIMEOUT_GENERAL}

Scroll Grid Horizontal By Field Id
    [Arguments]  ${gridId}    ${fieldId}
    ${scrollLeft}    Execute Javascript     return $('#${gridId} th.k-header[data-field="${fieldId}"]').prevAll().map(function(){return $(this).width()}).get().sum()
    Scroll Grid Horizontal    ${gridId}    ${scrollLeft}

Scroll Grid Vertical
    [Arguments]  ${gridId}    ${scrollTop}
    Scroll Vertical     jquery=#${gridId} .k-scrollbar-vertical    ${scrollTop}

Scroll Grid Vertical To Row Number
    [Arguments]  ${gridId}    ${rowHeight}    ${rowNumber}
    ${scrollTop}    Execute Javascript    return ${rowHeight}*(${rowNumber}-1)
    Scroll Grid Vertical    ${gridId}    ${scrollTop}

Back To Search
    Wait Progress Bar Closed
    Wait Until Element Is Visible    ${breadcrumbLinkSearchResults}
    Click Search Results Link
    Wait Search Page Document Loaded

Get Time From Date String
    [Arguments]  ${strDate}
    ${time}    Execute Javascript     return WC.DateHelper.LocalDateToUnixTime(kendo.parseDate("${strDate}", WC.FormatHelper.GetFormatter('datetime')))
    [Return]    ${time}

Click Element If Not Active
    [Arguments]  ${element}
    ${statusActive}    Is Element Has CssClass    ${element}    active
    Run Keyword If    ${statusActive} == False    Click Element    ${element}

Click Element If Active
    [Arguments]  ${element}
    ${statusActive}   Is Element Has CssClass    ${element}    active
    Run Keyword If    ${statusActive} == True    Click Element    ${element}

Is Image Exist
    [Arguments]  ${selector}
    ${jquerySelector}    Get JQuery Selector    ${selector}
    ${isExist}    Execute Javascript     return !!$('${jquerySelector}').get(0).naturalWidth
    [Return]    ${isExist}

Get Downloading Path
    ${now}    Get Time    epoch
    ${download directory}    Join Path    ${OUTPUT DIR}    downloads_${now}
    [Return]    ${download directory}

Open Browser in Sandbox Mode
    ${options}    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Open Chrome Browser With Options    ${options}

Set Default Downloading Path And Open Browser
    [Arguments]  ${download_directory}
    Create Directory    ${download_directory}
    ${options}    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    ${prefs}    Create Dictionary    download.default_directory=${download_directory}
    Call Method    ${options}    add_experimental_option    prefs    ${prefs}
    Open Chrome Browser With Options    ${options}

    ${library}       get library instance    SeleniumLibrary
    Enable Download In Headless Chrome    ${library.driver}    ${download directory} 

Open Chrome Browser With Options
    [Arguments]  ${options}

    # set options
    Call Method    ${options}    add_argument    --no-sandbox
    Run Keyword If  ${DevMode}==0   Call Method    ${options}    add_argument    --headless
    Run Keyword If  ${DevMode}==0   Call Method    ${options}    add_argument    --disable-gpu
    Call Method    ${options}    add_argument    --window-size\=1366,768

    ${status}    ${value}    Run Keyword And Ignore Error    Create WebDriver    Chrome    chrome_options=${options}
    Run Keyword If      '${status}' == 'FAIL'    Sleep    5s
    Run Keyword If      '${status}' == 'FAIL'    Create WebDriver    Chrome    chrome_options=${options}

Download should be done
    [Arguments]    ${download directory}
    [Documentation]    Verifies that the directory has only one folder and it is not a temp file.
    ...
    ...    Returns path to the file
    ${files}    List Files In Directory    ${download_directory}
    Length Should Be    ${files}    1    Should be only one file in the download folder
    Should Not Match Regexp    ${files[0]}    (?i).*\\.tmp    Chrome is still downloading a file
    ${file}    Join Path    ${download_directory}    ${files[0]}
    Log    File was successfully downloaded to ${file}
    [Return]    ${file}

Initialize Download Path
    ${path}    Get Downloading Path
    Set Suite Variable    ${DOWNLOAD_DIRECTORY}    ${path}
    Set Default Downloading Path And Open Browser    ${DOWNLOAD_DIRECTORY}

Initialize Download Path And Login With Admin User
    Initialize Download Path
    Go To    ${URL_WC}
    Login To WC By Admin User

Initialize Download Path And Login With Power User
    Initialize Download Path
    Go To    ${URL_WC}
    Login To WC By Power User

Empty Download Directory
    Empty Directory    ${DOWNLOAD_DIRECTORY}

Resize Kendo Popup height To
    [Arguments]    ${height}
    ${activePopup}=    Set Variable    .k-widget.k-window:visible
    ${overflowSpacing}=    Set Variable    105
    Execute JavaScript    $('${activePopup}').height(${height});
    Execute JavaScript    $('${activePopup} .popupContent').height(${height}-${overflowSpacing});
