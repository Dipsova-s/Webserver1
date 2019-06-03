using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Users;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class ConsolidateRoleHelper
    {
        public static JEnumerable<JProperty> CreatePrivilegeProperty(JToken node, JEnumerable<JProperty> allProperties)
        {
            JProperty privilegeChild = node.Children<JProperty>().FirstOrDefault(f => f.Name.ToLower() == "manage_model");
            if (privilegeChild != null)
            {
                string privilegeNode = @"{
                                ""Basic"": {"
                                    + GetJsonStringOfPrivilegeProperty(node, "access_data_via_webclient")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "allow_nonvalidated_items")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "allow_single_item_view")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "allow_export")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "access_data_via_odata")
                                    + "},"
                                    + "\"Advance\": {"
                                    + GetJsonStringOfPrivilegeProperty(node, "allow_more_details")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "save_displays")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "allow_followups")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "allow_advanced_filter")
                                    + "},"
                                    + "\"Contributor\": {"
                                    + GetJsonStringOfPrivilegeProperty(node, "allow_publish_dashboards")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "create_angles")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "create_template_angles")
                                    + "},"
                                    + "\"Administrator\": {"
                                    + GetJsonStringOfPrivilegeProperty(node, "manage_model")
                                    + "," + GetJsonStringOfPrivilegeProperty(node, "manage_private_items")
                                    + "}}";

                JObject privilegeNodeString = JObject.Parse(privilegeNode.Replace("\r", "").Replace("\n", ""));
                allProperties = privilegeNodeString.Children<JProperty>();
            }
            return allProperties;
        }

        public static string GetJsonStringOfPrivilegeProperty(JToken node, string propertyName)
        {
            JProperty property = node.Children<JProperty>().FirstOrDefault(f => f.Name == propertyName);
            string viewModelResource = JsonResourceHandler.GetResource<ConsolidatedRoleViewModel>(property.Name);
            string viewModelValue = string.IsNullOrEmpty(property.Value.ToString()) ? "null" : 
                                    property.Value.ToString().ToLower();

            return string.Format("\"{0}\": {1}", viewModelResource, viewModelValue);
        }

        public static JEnumerable<JProperty> OrderModelPrivilege(JToken node, JEnumerable<JProperty> allProperties)
        {
            JEnumerable<JProperty> childNodes = node.Children<JProperty>();

            // order nodes if it contains privilege
            bool containPrivileges = childNodes.Any(f => f.Name.Equals("privileges", StringComparison.OrdinalIgnoreCase));
            if (containPrivileges)
            {
                JObject newObject = new JObject();
                string[] orderNames = new string[]
                {
                    "privileges",
                    "label_authorizations",
                    "allowed_classes",
                    "denied_classes",
                    "field_authorizations", 
                    "object_filters"
                };

                // add each in order
                foreach (string name in orderNames)
                {
                    JProperty property = childNodes.FirstOrDefault(f => f.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
                    if (property != null)
                        newObject.Add(property);
                }

                // add others
                IEnumerable<JProperty> otherProperty = childNodes.Where(f => !orderNames.Contains(f.Name.ToLowerInvariant()));
                if (otherProperty != null)
                {
                    foreach (var item in otherProperty)
                        newObject.Add(item);
                }
                allProperties = newObject.Children<JProperty>();
            }
            return allProperties;
        }

        public static string ChangePriviledgeState(string state, JToken node, JProperty property)
        {
            //check label, return its own state.
            string currentState = (state ?? string.Empty).ToLowerInvariant();
            var businessProcessLabel = node.Children<JProperty>().FirstOrDefault(f => f.Name.ToLowerInvariant() == "p2p");
            if (businessProcessLabel == null && property.Name != "default_label_authorization")
            {
                if (currentState == "true" || currentState == "allowed")
                    return "allowed";
                else if (currentState == "false" || currentState == "disallowed" || currentState == "denied")
                    return "denied";
                else if (currentState == "unspecified")
                    return "unspecified";
            }
            else if (currentState == "deny")
            {
                return "denied";
            }

            return state;
        }

        public static JEnumerable<JProperty> CreateClassProperty(JToken token, JToken node)
        {
            JObject newFieldNode = new JObject();

            foreach (var item in token.Children<JProperty>())
            {
                if (item.Name.ToLower() == "classes")
                {
                    JObject newClassNode = new JObject();
                    newFieldNode.Add("Classes: " + (item.Value).First().ToString(), newClassNode);
                }
                else
                {
                    //Check Reomove Unused properties
                    if (node.Path == "field_authorizations" || node.Path == "modelserver_authorization.field_authorizations"
                        || ((node.Path == "object_filters" || node.Path == "modelserver_authorization.object_filters")
                            && (item.Name == "reference_filters" || item.Name == "field_filters" || item.Name == "fieldvalue_filters"))
                        )
                    {
                        JProperty lastestClass = newFieldNode.Children<JProperty>().LastOrDefault();
                        if (lastestClass != null)
                        {
                            JObject lastestClassObject = (JObject)lastestClass.Value;
                            lastestClassObject.Add(item);
                        }
                        else
                            newFieldNode.Add(item);
                    }
                }
            }

            return newFieldNode.Children<JProperty>();
        }

        public static string GetFieldNameWithFieldSource(List<Field> fieldList, string fieldId, List<FieldCategoryViewModel> fieldSourceList)
        {
            Field currentField = fieldList.FirstOrDefault(f => f.id == fieldId);
            string fieldName = currentField != null && !string.IsNullOrEmpty(currentField.short_name) ?
                               currentField.short_name : 
                               fieldId;

            string fieldSource = string.Empty;
            if (currentField != null)
            {
                FieldCategoryViewModel currentFieldSource = fieldSourceList.SingleOrDefault(f => f.uri == currentField.source);
                fieldSource = currentFieldSource != null && !string.IsNullOrEmpty(currentFieldSource.short_name)
                    ? currentFieldSource.short_name
                    : string.Empty;
            }

            return !string.IsNullOrEmpty(fieldSource) ? string.Format("{0}-{1}", fieldSource, fieldName) : fieldName;
        }
    }
}
