using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ModuleViewModel
    {
        public string id { get; set; }
        public List<ModuleViewModel> modules { get; set; }

        public string name { get; set; }

        public ModuleListViewModel ModuleList { get; set; }

        public DataTable ModuleDetail { get; set; }

    }

    public class ModuleInfoViewModel
    {
        public string id { get; set; }
        public string info_uri { get; set; }
        public string name { get; set; }
        public string value { get; set; }
    }

    public class ModuleListViewModel
    {

        public int? fakeId { get; set; }

        public string id { get; set; }

        public string name { get; set; }

        public string created_on { get; set; }

        public string created_by { get; set; }

        public string description { get; set; }

        public List<string> requires { get; set; }

        public bool? required { get; set; }

        public int? parentId { get; set; }

        public bool? licensed { get; set; }

        public bool? configurable { get; set; }

        public bool enabled { get; set; }

        public string idString
        {
            get { return id; }
        }

        public string textid { get; set; }

        public ModuleExtension ModuleExtensionLongText
        {
            get
            {
                if (module_extensions == null)
                {
                    return null;
                }
                else
                {
                    return module_extensions.FirstOrDefault(filter => filter.type == "sap_long_texts");
                }
            }
        }

        public ModuleExtension ModuleExtensionPartnerRoles
        {
            get
            {
                if (module_extensions == null)
                {
                    return null;
                }
                else
                {
                    return module_extensions.FirstOrDefault(filter => filter.type == "sap_partner_roles");
                }
            }
        }

        public ModuleExtension ModuleExtensionClassifications
        {
            get
            {
                if (module_extensions == null)
                {
                    return null;
                }
                else
                {
                    return module_extensions.FirstOrDefault(filter => filter.type == "sap_classifications");
                }
            }
        }

        public ModuleExtension ModuleExtensionStatus
        {
            get
            {
                if (module_extensions == null)
                {
                    return null;
                }
                else
                {
                    return module_extensions.FirstOrDefault(filter => filter.type == "sap_statuses");
                }
            }
        }

        public string LongTextUri
        {
            get
            {
                return ModuleExtensionLongText != null ? ModuleExtensionLongText.TypeUri.ToString() : string.Empty;
            }
        }

        public int TotalLongText
        {
            get
            {
                return ModuleExtensionLongText != null ? ModuleExtensionLongText.activated_items_count : 0;
            }
        }



        public string ClassificationUri
        {
            get
            {
                if (module_extensions == null)
                {
                    return string.Empty;
                }
                else
                {
                    var sap_classifications = module_extensions.FirstOrDefault(filter => filter.type == "sap_classifications");
                    return sap_classifications != null ? sap_classifications.TypeUri.ToString() : string.Empty;
                }
            }
        }

        public string ClassificationGenericUri
        {
            get
            {
                if (module_extensions == null)
                {
                    return string.Empty;
                }
                else
                {
                    var sap_classifications = module_extensions.FirstOrDefault(filter => filter.type == "sap_classifications");
                    return sap_classifications != null ? sap_classifications.GenericUri.ToString() : string.Empty;
                }
            }
        }

        public int TotalClassification
        {
            get
            {
                if (module_extensions == null)
                {
                    return 0;
                }
                else
                {
                    ModuleExtension classification = module_extensions.FirstOrDefault(filter => filter.type == "sap_classifications");
                    return classification != null ? classification.activated_items_count : 0;
                }
            }
        }

        public string PartnerRolesUri
        {
            get
            {
                if (module_extensions == null)
                {
                    return string.Empty;
                }
                else
                {
                    var sap_partner_roles = module_extensions.FirstOrDefault(filter => filter.type == "sap_partner_roles");
                    return sap_partner_roles != null ? sap_partner_roles.TypeUri.ToString() : string.Empty;
                }
            }
        }

        public int TotalPartnerRoles
        {
            get
            {
                if (module_extensions == null)
                {
                    return 0;
                }
                else
                {
                    ModuleExtension partnerRoles = module_extensions.FirstOrDefault(filter => filter.type == "sap_partner_roles");
                    return partnerRoles != null ? partnerRoles.activated_items_count : 0;
                }
            }
        }

        public string StatusUri
        {
            get
            {
                if (module_extensions == null)
                {
                    return string.Empty;
                }
                else
                {
                    var sap_statuses = module_extensions.FirstOrDefault(filter => filter.type == "sap_statuses");
                    if (sap_statuses != null)
                    {
                        return sap_statuses.GenericUri.ToString();
                    }
                    else
                    {
                        return string.Empty;
                    }
                }
            }
        }

        public int TotalStatus
        {
            get
            {
                if (module_extensions == null)
                {
                    return 0;
                }
                else
                {
                    ModuleExtension status = module_extensions.FirstOrDefault(filter => filter.type == "sap_statuses");
                    return status != null ? status.activated_items_count : 0;
                }
            }
        }


        [JsonProperty(PropertyName = "module_extensions")]
        public List<ModuleExtension> module_extensions { get; set; }

        public List<ModuleListViewModel> Items { get; set; }

    }

    public class ModuleExtension
    {
        public string type { get; set; }

        public int activated_items_count { get; set; }

        public string info { get; set; }

        private Uri genericUri;
        [JsonProperty(PropertyName = "plaintext_uri")]
        public Uri GenericUri
        {
            get { return genericUri; }
            set
            {
                genericUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri typeUri;
        [JsonProperty(PropertyName = "type_uri")]
        public Uri TypeUri
        {
            get { return typeUri; }
            set
            {
                typeUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }
    }

    public class SubModuleId
    {
        public string id { get; set; }
    }
}
