var cellDrillDownItems = [{ FieldName: "left3_MaterialType", FieldValue: "Foo" }, { FieldName: "left3_MaterialType", FieldValue: "Foo " }, { FieldName: "left3_MaterialType", FieldValue: "" }, { FieldName: "individual_NB_CREATED_BY", FieldValue: "AA6188D0-1897-4166-AFD5-DFF3C6BEE52C" }, { FieldName: "individual_CompanyCode__BUTXT", FieldValue: "Company Turkey" }, { FieldName: "individual__TST_Boolean_false", FieldValue: "False" }, { FieldName: "left3_CodeGroup", FieldValue: "1\\A-100" }, { FieldName: "power10_3_StockLeveragePotential", FieldValue: 6000 }];
var mockCountSetting = { Index: 1, CellFormat: "F0,count,N", CellFormatType: 3, Area: 3, Caption: "Count", DefaultCaption: "Count", FieldName: "count", Operator: "count", CssClass: "data", InternalID: "d68afeec-21b1-6808-a657-468478141118", DataType: "int", IsDomain: false, DomainURI: "", MayBeSorted: true, SortDirection: "", FieldDetails: "{\"pivot_area\":\"data\",\"prefix\":\"N\",\"decimals\":0,\"thousandseparator\":false,\"sorting\":\"\"}", MultiLangAlias: [], "IsSelected": true, Valid: true, ValidError: "", Bucket: { field_type: "aggregation_fields", Operator: "count", field: "count" } }
var mockDateTimeFieldSetting = { Index: 1, CellFormat: "", CellFormatType: 2, "Area": 0, SourceField: "TheDateTime", Caption: "(Self) - TheDateTime  [Per day]", DefaultCaption: "(Self) - TheDateTime  [Per day]", FieldName: "day_TheDateTime", Operator: "day", CssClass: "row", InternalID: "68573601-884b-a084-082f-469584035597", DataType: "datetime", IsDomain: false, DomainURI: "", MayBeSorted: true, SortDirection: "", FieldDetails: "{\"pivot_area\":\"row\",\"suffix\":\"\",\"sorting\":\"\"}", MultiLangAlias: [], IsSelected: true, Valid: true, ValidError: "", Bucket: { "field_type": "grouping_fields", "Operator": "day", "source_field": "TheDateTime", "field": "count" } };
var mockAngles = [{ "multi_lang_name": [{ "lang": "en", "text": "Angle For General Test" }], "multi_lang_description": [], "authorizations": { "update": true, "delete": true, "publish": false, "unpublish": true, "validate": true, "unvalidate": false, "mark_template": true, "unmark_template": false, "create_private_display": true, "create_public_display": true }, "is_deleted": false, "displays": "/models/1/angles/1028/displays", "allow_followups": true, "allow_more_details": true, "assigned_labels": ["S2D"], "labels": "/models/1/angles/1028/labels", "business_processes": "/models/1/angles/1028/business_processes", "grouping_labels": "/models/1/angles/1028/grouping_labels", "angle_default_display": "/models/1/angles/1028/displays/2900", "privilege_labels": "/models/1/angles/1028/privilege_labels", "package": "/packages/9", "query_definition": [{ "base_classes": ["PurchaseOrder", "PurchaseOrderScheduleLine"], "queryblock_type": "base_classes" }], "display_definitions": [{ "multi_lang_name": [{ "lang": "en", "text": "New Display" }], "multi_lang_description": [], "angle_id": "1028", "display_details": "{}", "query_blocks": [], "fields": [{ "multi_lang_alias": [], "field": "ObjectType", "field_details": "{\"width\":81,\"format\":\"shn\"}", "valid": true }, { "multi_lang_alias": [], "field": "ID", "field_details": "{\"width\":97}", "valid": true }, { "multi_lang_alias": [], "field": "Vendor__Vendor", "field_details": "{\"width\":80}", "valid": true, "tech_info": "LFA1-LIFNR" }, { "multi_lang_alias": [], "field": "Vendor__Description", "field_details": "{\"width\":168}", "valid": true, "tech_info": "LFA1-NAME1" }, { "multi_lang_alias": [], "field": "PurchasingDocumentCategory", "field_details": "{\"width\":105,\"format\":\"shnln\"}", "valid": true, "tech_info": "EKKO-BSTYP" }, { "multi_lang_alias": [], "field": "CompanyCode__CompanyCode", "field_details": "{\"width\":92,\"format\":\"shn\"}", "valid": true, "tech_info": "T001-BUKRS" }, { "multi_lang_alias": [], "field": "PurchaseOrganization__PurchaseOrganization", "field_details": "{\"width\":93}", "valid": true, "tech_info": "T024E-EKORG" }, { "multi_lang_alias": [], "field": "ExecutionStatus", "field_details": "{\"width\":97,\"format\":\"shn\"}", "valid": true }, { "multi_lang_alias": [], "field": "CreationDate", "field_details": "{\"width\":84}", "valid": true, "tech_info": "EKKO-AEDAT" }, { "multi_lang_alias": [], "field": "DeliveryStatus", "field_details": "{\"width\":89,\"format\":\"shn\"}", "valid": true }, { "multi_lang_alias": [], "field": "OrderedValue", "field_details": "{\"width\":97}", "valid": true }, { "multi_lang_alias": [], "field": "BKGRP", "field_details": "{\"width\":120}", "valid": true, "tech_info": "EKKO-EKGRP" }], "state": "/models/1/angles/1028/displays/2900/state", "id": "d5a65df3da1aa744efb75465897637580", "uri": "/models/1/angles/1028/displays/2900", "display_type": "list", "is_angle_default": true, "authorizations": { "update": true, "delete": false, "publish": false, "unpublish": false, "make_angle_default": false }, "created": { "user": "/users/1", "datetime": 1469446028, "full_name": "EAAdmin" }, "is_public": true, "user_specific": { "is_user_default": false, "execute_on_login": false }, "contained_aggregation_steps": false, "is_parameterized": false }, { "multi_lang_name": [{ "lang": "en", "text": "Test Pivot 1" }], "multi_lang_description": [], "angle_id": "1028", "display_details": "{\"columns\":{\"header\":[205,80],\"data\":[100,100]}}", "query_blocks": [{ "query_steps": [{ "field": "ExecutionStatus", "operator": "equal_to", "arguments": ["es0ToBeExecuted"], "step_type": "filter" }, { "field": "Quantity", "operator": "less_than", "arguments": [2000], "step_type": "filter" }, { "field": "BottleneckType", "operator": "in_set", "arguments": ["bt00None", "bt01PlanningShortage"], "step_type": "filter" }, { "aggregation_fields": [{ "field": "count", "operator": "count" }], "grouping_fields": [{ "field": "individual_BottleneckType", "operator": "individual", "source_field": "BottleneckType" }, { "field": "month_RequirementsDate", "operator": "month", "source_field": "RequirementsDate" }, { "field": "individual_ExecutionStatus", "operator": "individual", "source_field": "ExecutionStatus" }, { "field": "power10_3_Quantity", "operator": "power10_3", "source_field": "Quantity" }], "step_type": "aggregation" }], "queryblock_type": "query_steps" }], "fields": [{ "multi_lang_alias": [], "field": "individual_BottleneckType", "field_details": "{\"format\":\"shnln\",\"pivot_area\":\"row\",\"sorting\":\"asc\"}", "valid": true }, { "multi_lang_alias": [], "field": "month_RequirementsDate", "field_details": "{\"pivot_area\":\"row\",\"sorting\":\"asc\"}", "valid": true }, { "multi_lang_alias": [], "field": "individual_ExecutionStatus", "field_details": "{\"format\":\"shnln\",\"pivot_area\":\"column\",\"sorting\":\"asc\"}", "valid": true }, { "multi_lang_alias": [], "field": "power10_3_Quantity", "field_details": "{\"decimals\":0,\"prefix\":null,\"thousandseparator\":false,\"pivot_area\":\"column\",\"sorting\":\"asc\"}", "valid": true }, { "multi_lang_alias": [], "field": "count", "field_details": "{\"pivot_area\":\"data\",\"prefix\":null,\"decimals\":0,\"thousandseparator\":false,\"sorting\":\"\"}", "valid": true }], "state": "/models/1/angles/1028/displays/2901/state", "id": "d1aa88e6ea77b6951d614466755531469", "uri": "/models/1/angles/1028/displays/2901", "display_type": "pivot", "is_angle_default": false, "authorizations": { "update": true, "delete": true, "publish": false, "unpublish": true, "make_angle_default": true }, "created": { "user": "/users/1", "datetime": 1469446028, "full_name": "EAAdmin" }, "is_public": false, "user_specific": { "is_user_default": false, "execute_on_login": false }, "contained_aggregation_steps": true, "is_parameterized": false }, { "multi_lang_name": [{ "lang": "en", "text": "Test Chart 1" }], "multi_lang_description": [], "angle_id": "1028", "display_details": "{\"chart_type\":\"area\",\"stack\":false,\"multi_axis\":false,\"axistitle\":\"show\",\"axisvalue\":\"show\",\"datalabel\":\"mouse\",\"gridline\":\"show\",\"legend\":\"show\",\"range\":{\"start\":0,\"size\":24},\"count_index\":0,\"axisscale\":\"automatic\"}", "query_blocks": [{ "query_steps": [{ "aggregation_fields": [{ "field": "sum_ClaimedStocksValue", "operator": "sum", "source_field": "ClaimedStocksValue" }], "grouping_fields": [{ "field": "power10_3_OrderedValue", "operator": "power10_3", "source_field": "OrderedValue" }, { "field": "individual_Material__BaseUnitOfMeasure", "operator": "individual", "source_field": "Material__BaseUnitOfMeasure", "tech_info": "MARA-MEINS" }], "step_type": "aggregation" }], "queryblock_type": "query_steps" }], "fields": [{ "multi_lang_alias": [], "field": "power10_3_OrderedValue", "field_details": "{\"pivot_area\":\"row\",\"decimals\":0,\"thousandseparator\":false,\"prefix\":\"N\",\"suffix\":\"USD\",\"sorting\":\"\"}", "valid": true }, { "multi_lang_alias": [], "field": "individual_Material__BaseUnitOfMeasure", "field_details": "{\"format\":\"shnln\",\"pivot_area\":\"column\",\"sorting\":\"\"}", "valid": true }, { "multi_lang_alias": [], "field": "sum_ClaimedStocksValue", "field_details": "{\"decimals\":2,\"prefix\":\"K\",\"pivot_area\":\"data\",\"sorting\":\"\",\"thousandseparator\":false}", "valid": true }], "state": "/models/1/angles/1028/displays/2902/state", "id": "ea445a2ab24ed1461cad1133fe434c1278", "uri": "/models/1/angles/1028/displays/2902", "display_type": "chart", "is_angle_default": false, "authorizations": { "update": true, "delete": true, "publish": false, "unpublish": true, "make_angle_default": true }, "created": { "user": "/users/1", "datetime": 1469446028, "full_name": "EAAdmin" }, "is_public": true, "user_specific": { "is_user_default": false, "execute_on_login": false }, "contained_aggregation_steps": true, "is_parameterized": false }], "changed": { "user": "/users/2", "datetime": 1469446028, "full_name": "EASystem" }, "executed": { "user": "/users/1", "datetime": 1469504636, "full_name": "EAAdmin" }, "published": { "user": "/users/2", "datetime": 1469446028, "full_name": "EASystem" }, "id": "ROBOT_ANGLE_GENERAL_TEST", "uri": "/models/1/angles/1028", "model": "/models/1", "is_validated": false, "is_parameterized": false, "is_published": true, "is_template": false, "user_specific": { "execute_on_login": false, "is_starred": false, "private_tags": [], "times_executed": 44 }, "created": { "user": "/users/1", "datetime": 1469446028, "full_name": "EAAdmin" }, "has_warnings": false, "state": "/models/1/angles/1028/state" }, { "multi_lang_name": [{ "lang": "en", "text": "Angle for Dashboard Test 1" }], "multi_lang_description": [], "authorizations": { "update": true, "delete": true, "publish": false, "unpublish": true, "validate": true, "unvalidate": false, "mark_template": true, "unmark_template": false, "create_private_display": true, "create_public_display": true }, "is_deleted": false, "displays": "/models/1/angles/1032/displays", "allow_followups": true, "allow_more_details": true, "assigned_labels": ["S2D"], "labels": "/models/1/angles/1032/labels", "business_processes": "/models/1/angles/1032/business_processes", "grouping_labels": "/models/1/angles/1032/grouping_labels", "angle_default_display": "/models/1/angles/1032/displays/2906", "privilege_labels": "/models/1/angles/1032/privilege_labels", "package": "/packages/9", "query_definition": [{ "base_classes": ["PurchaseOrder", "PurchaseOrderScheduleLine"], "queryblock_type": "base_classes" }, { "query_steps": [{ "field": "PurchasingDocumentCategory", "operator": "equal_to", "arguments": [{ "argument_type": "value", "value": "A" }], "is_execution_parameter": true, "execution_parameter_id": "eaf69c0f8119e5400cbc34c1776c6f466d", "step_type": "filter", "tech_info": "EKKO-BSTYP" }], "queryblock_type": "query_steps" }], "display_definitions": [{ "multi_lang_name": [{ "lang": "en", "text": "New Display" }], "multi_lang_description": [], "angle_id": "1032", "display_details": "{}", "query_blocks": [{ "query_steps": [{ "field": "ExecutionStatus", "operator": "equal_to", "arguments": [{ "argument_type": "value", "value": "es0ToBeExecuted" }], "is_execution_parameter": true, "execution_parameter_id": "eab630425629de488d901c70eed74cdca8", "step_type": "filter" }], "queryblock_type": "query_steps" }], "fields": [{ "multi_lang_alias": [], "field": "ObjectType", "field_details": "{\"width\":81,\"format\":\"shn\"}", "valid": true, "tech_info": "" }, { "multi_lang_alias": [], "field": "ID", "field_details": "{\"width\":97}", "valid": true, "tech_info": "" }, { "multi_lang_alias": [], "field": "Vendor__Vendor", "field_details": "{\"width\":80}", "valid": true, "tech_info": "LFA1-LIFNR" }, { "multi_lang_alias": [], "field": "Vendor__Description", "field_details": "{\"width\":168}", "valid": true, "tech_info": "LFA1-NAME1" }, { "multi_lang_alias": [], "field": "PurchasingDocumentCategory", "field_details": "{\"width\":105,\"format\":\"shnln\"}", "valid": true, "tech_info": "EKKO-BSTYP" }, { "multi_lang_alias": [], "field": "CompanyCode__CompanyCode", "field_details": "{\"width\":92,\"format\":\"shn\"}", "valid": true, "tech_info": "T001-BUKRS" }, { "multi_lang_alias": [], "field": "PurchaseOrganization__PurchaseOrganization", "field_details": "{\"width\":93}", "valid": true, "tech_info": "T024E-EKORG" }, { "multi_lang_alias": [], "field": "ExecutionStatus", "field_details": "{\"width\":97,\"format\":\"shn\"}", "valid": true, "tech_info": "" }, { "multi_lang_alias": [], "field": "CreationDate", "field_details": "{\"width\":84}", "valid": true, "tech_info": "EKKO-AEDAT" }], "state": "/models/1/angles/1032/displays/2906/state", "id": "d211f5197fdaf0592a0ab467962326034", "uri": "/models/1/angles/1032/displays/2906", "display_type": "list", "is_angle_default": true, "authorizations": { "update": true, "delete": false, "publish": false, "unpublish": false, "make_angle_default": false }, "created": { "user": "/users/1", "datetime": 1469446029, "full_name": "EAAdmin" }, "is_public": true, "user_specific": { "is_user_default": false, "execute_on_login": false }, "contained_aggregation_steps": false, "is_parameterized": true }], "changed": { "user": "/users/1", "datetime": 1469517864, "full_name": "EAAdmin" }, "executed": { "user": "/users/1", "datetime": 1469517926, "full_name": "EAAdmin" }, "published": { "user": "/users/1", "datetime": 1469517864, "full_name": "EAAdmin" }, "id": "ROBOT_ANGLE_FOR_DASHBOARD_TEST1", "uri": "/models/1/angles/1032", "model": "/models/1", "is_validated": false, "is_parameterized": true, "is_published": true, "is_template": false, "user_specific": { "execute_on_login": false, "is_starred": false, "private_tags": [], "times_executed": 17 }, "created": { "user": "/users/1", "datetime": 1469446029, "full_name": "EAAdmin" }, "has_warnings": false, "state": "/models/1/angles/1032/state" }];