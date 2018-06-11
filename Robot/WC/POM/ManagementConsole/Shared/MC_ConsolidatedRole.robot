*** Variables ***
${popupConsoliDatedRole}    jquery=#ConsoliDatedRolePopup
${treeviewRoles}            jquery=#ConsoliDatedRolePopup .k-treeview
${btnCollapseRole}          jquery=#ConsoliDatedRolePopup .btnCollapse
${btnExpandRole}            jquery=#ConsoliDatedRolePopup .btnExpand
${btnCloseRole}             jquery=#ConsoliDatedRolePopup .btnPrimary

*** Keywords ***
Wait Consolidated Role Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${treeviewRoles}:first
    Wait Until Element Is Visible       ${treeviewRoles}:first

    # resize popup
    ${popupConsoliDatedRoleSelector}    Get JQuery Selector    ${popupConsoliDatedRole}
    Execute JavaScript    $('${popupConsoliDatedRoleSelector}').data('kendoWindow').wrapper.height(500);
    Execute JavaScript    $('${popupConsoliDatedRoleSelector}').data('kendoWindow').resize();
    Sleep    ${TIMEOUT_GENERAL}

Click Collapse All Roles
    Click Element    ${btnCollapseRole}
    Sleep    ${TIMEOUT_GENERAL}

Click Expand All Roles
    Click Element    ${btnExpandRole}
    Sleep    ${TIMEOUT_GENERAL}

Click Close Consolidated Role Popup
    Click Element    ${btnCloseRole}