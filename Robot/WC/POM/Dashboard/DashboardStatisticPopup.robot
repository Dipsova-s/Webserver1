*** Variables ***
${divPopupDashboardStatistic}         jquery=.popup-info
${btnCloseDashboardStatisticPopup}    ${divPopupDashboardStatistic} .k-window-action[aria-label="Close"]
${btnDashboardInfo}                   ${tabDashboard} .action.btn-info

*** Keywords ***
Dashboard Statistic Button Should Be Visible
    Sleep    ${TIMEOUT_LARGEST}
    Mouse Over      ${tabDashboard}
    Element Should Be Visible  ${btnDashboardInfo}

Dashboard Statistic Button Should Not Be Visible
    Sleep    ${TIMEOUT_LARGEST}
    Mouse Over      ${tabDashboard}
    Element Should Not Be Visible  ${btnDashboardInfo}

Open Dashboard Statistic Popup
    Dashboard Statistic Button Should Be Visible
    Click Element   ${btnDashboardInfo}

Close Dashboard Statistic Popup
    Click Element   ${btnCloseDashboardStatisticPopup}

Check Dashboard Statistic Info
    Page Should Contain    Statistics
    Page Should Contain    Created by
    Page Should Contain    Last changed by
    Page Should Contain    Last executed by