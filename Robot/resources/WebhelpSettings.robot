*** Variables ***
${WEBHELP_ITEMS_PATH}       ${EXECDIR}/webhelp_items
${WEBHELP_ANGLES_PATH}      ${WEBHELP_ITEMS_PATH}/angles/
${WEBHELP_DASHBOARDS_PATH}  ${WEBHELP_ITEMS_PATH}/dashboards/
${WEBHELP_MOVIES_PATH}      ${WEBHELP_ITEMS_PATH}/movies/
${WEBHELP_MOVIES_TARGET}    C:/inetpub/wwwroot/${Branch}/resources/
${WEBHELP_COMMON_FOLDER}    language_independent
${WEBHELP_WC_OUTPUT}        ${EXECDIR}/webhelp/Webclient/${WEBHELP_COMMON_FOLDER}
${WEBHELP_MC_OUTPUT}        ${EXECDIR}/webhelp/ManagementConsole/${WEBHELP_COMMON_FOLDER}
${WEBHELP_USER_ROLES}       [{"role_id":"SYSTEM_ALL"},{"role_id":"EA2_800_ALL","model_id":"EA2_800"}]}]

# users
&{WEBHELP_USER_EN}  name=msmith    password=${Password}  language=en  output=language_dependent/en  roles=${WEBHELP_USER_ROLES}
&{WEBHELP_USER_NL}  name=edejong   password=${Password}  language=nl  output=language_dependent/nl  roles=${WEBHELP_USER_ROLES}
&{WEBHELP_USER_FR}  name=adubois   password=${Password}  language=fr  output=language_dependent/fr  roles=${WEBHELP_USER_ROLES}
&{WEBHELP_USER_DE}  name=cmueller  password=${Password}  language=de  output=language_dependent/de  roles=${WEBHELP_USER_ROLES}
&{WEBHELP_USER_ES}  name=jgarcia   password=${Password}  language=es  output=language_dependent/es  roles=${WEBHELP_USER_ROLES}
@{WEBHELP_USERS}  ${WEBHELP_USER_EN}  ${WEBHELP_USER_NL}  ${WEBHELP_USER_FR}  ${WEBHELP_USER_DE}  ${WEBHELP_USER_ES}