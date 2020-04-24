*** Variables ***
${divPopupDisplayStatistic}         jquery=.popup-info
${btnCloseDisplayStatisticPopup}    ${divPopupDisplayStatistic} .k-window-action[aria-label="Close"]
${btnDisplayInfo}                   ${tabDisplay} .action.btn-info

*** Keywords ***
Display Statistic Button Should Be Visible
    Sleep    ${TIMEOUT_LARGEST}
    Mouse Over      ${tabDisplay}
    Element Should Be Visible  ${btnDisplayInfo}

Display Statistic Button Should Not Be Visible
    Sleep    ${TIMEOUT_LARGEST}
    Mouse Over      ${tabDisplay}
    Element Should Not Be Visible  ${btnDisplayInfo}

Open Display Statistic Popup
    Display Statistic Button Should Be Visible
    Click Element   ${btnDisplayInfo}

Close Display Statistic Popup
    Click Element   ${btnCloseDisplayStatisticPopup}

Check Display Statistic Info
    Page Should Contain    Statistics
    Page Should Contain    Created by
    Page Should Contain    Last changed by