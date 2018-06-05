using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using EveryAngle.Core.ViewModels.Model;


namespace EveryAngle.Core.ViewModels.Users
{
    [Serializable]
    public class ObjectFilterViewModel
    {
        [JsonProperty(PropertyName = "classes")]
        [LocalizedDisplayName("MC_Classes")]
        public List<string> Classes { get; set; }

        [JsonProperty(PropertyName = "reference_filters")]
        [LocalizedDisplayName("MC_ReferenceFilters")]
        public List<ReferenceFilterViewModel> ReferenceFilter { get; set; }

        public string Ids
        {
            get
            {
                if (Classes != null)
                {

                    return string.Join(",", Classes.Select(str => str.Replace("*", "any object")));
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "field_filters")]
        [LocalizedDisplayName("MC_FieldFilters")]
        public List<FieldFilterViewModel> field_filters { get; set; }

        [LocalizedDisplayName("MC_ShortName")]
        public string ShortName { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [LocalizedDisplayName("MC_Index")]
        public string Index
        {
            get
            {
                return Guid.NewGuid().ToString();
            }
        }


        [JsonProperty(PropertyName = "allow_all_null")]
        [LocalizedDisplayName("MC_AllowAllNull")]
        public bool? allow_all_null { get; set; }

        [JsonProperty(PropertyName = "fieldvalue_filters")]
        [LocalizedDisplayName("MC_FieldvalueFilters")]
        public List<FieldFilterViewModel> fieldvalue_filters { get; set; } 

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [LocalizedDisplayName("MC_AllFields")]
        public List<string> AllFields
        {
            get
            {
                List<string> allFields = new List<string>();
                if (ReferenceFilter != null)
                {
                    foreach (var filter in ReferenceFilter)
                    {
                        if (filter.field_filters != null)
                        {
                            foreach (var fieldFilter in filter.field_filters)
                            {
                                allFields.Add(fieldFilter.field);
                            }
                        }
                    }
                }

                if (field_filters != null)
                {
                    foreach (var filter in field_filters)
                    {
                        allFields.Add(filter.field);
                    }
                }

                return allFields;
            }
        }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        [LocalizedDisplayName("MC_AllFilters")]
        public List<FilterDtoViewModel> AllFilters
        {
            get
            {
                List<FilterDtoViewModel> allFilters = new List<FilterDtoViewModel>();
                if (ReferenceFilter != null)
                {
                    foreach (var filter in ReferenceFilter)
                    {
                        if (filter.field_filters != null)
                        {
                            foreach (var fieldFilter in filter.field_filters)
                            {
                                FilterDtoViewModel newFilter = new FilterDtoViewModel();
                                newFilter.ClassId = this.Classes.FirstOrDefault();
                                newFilter.TargetClassId = filter.TargetClass;
                                newFilter.TargetClassName = filter.TargetClassShortName;
                                newFilter.AllowedAllNull = filter.allow_all_null;
                                newFilter.FieldId = fieldFilter.field;
                                newFilter.FieldName = fieldFilter.FieldShortName;

                                newFilter.AllowedValues = fieldFilter.allowed_values;
                                newFilter.DisAllowedValues = fieldFilter.disallowed_values;
                                newFilter.Domains = fieldFilter.Domains;
                                newFilter.DomainUri = fieldFilter.DomainUri;
                                allFilters.Add(newFilter);
                            }
                        }
                    }
                }

                if (field_filters != null)
                {
                    foreach (var filter in field_filters)
                    {
                        FilterDtoViewModel newFilter = new FilterDtoViewModel();
                        newFilter.AllowedValues = filter.allowed_values;
                        newFilter.TargetClassId = "(self)";
                        newFilter.FieldId = filter.field;
                        newFilter.FieldName = filter.FieldShortName;
                        newFilter.DisAllowedValues = filter.disallowed_values;

                        newFilter.IsReferenceFilter = false;
                        newFilter.ClassId = this.Classes.FirstOrDefault();
                        newFilter.Domains = filter.Domains;
                        newFilter.DomainUri = filter.DomainUri;
                        allFilters.Add(newFilter);
                    }
                }
                return allFilters;
            }
        }
    }

    [Serializable]
    public class ReferenceFilterViewModel
    {
        [JsonProperty(PropertyName = "target_class")]
        [LocalizedDisplayName("MC_TargetClass")]
        public string TargetClass { get; set; }

        [LocalizedDisplayName("MC_TargetClassShortName")]
        public string TargetClassShortName { get; set; }

        [LocalizedDisplayName("MC_AllowEmptyReference")]
        [JsonProperty(PropertyName = "allow_all_null")]
        public bool allow_all_null { get; set; }

        [LocalizedDisplayName("MC_FieldvalueFilters")]
        [JsonProperty(PropertyName = "fieldvalue_filters")]
        public List<FieldFilterViewModel> fieldvalue_filters { get; set; }

        [LocalizedDisplayName("MC_FieldFilters")]
        [JsonProperty(PropertyName = "field_filters")]
        public List<FieldFilterViewModel> field_filters { get; set; }

        [LocalizedDisplayName("MC_AvailableClassesName")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<string> AvailableClassesName { get; set; }


        [LocalizedDisplayName("MC_Index")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int Index { get; set; }

        [LocalizedDisplayName("MC_Deleted")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool Deleted { get; set; }

    }

    [Serializable]
    public class FieldFilterViewModel
    {
        [JsonProperty(PropertyName = "field")]
        public string field { get; set; }

        [LocalizedDisplayName("MC_FieldShortName")]
        public string FieldShortName { get; set; }

        [JsonProperty(PropertyName = "allowed_values")]
        [LocalizedDisplayName("MC_AllowedValues")]
        public List<string> allowed_values { get; set; }

        [LocalizedDisplayName("MC_AllowedValuesName")]
        public string AllowedValuesName
        {
            get
            {
                if (allowed_values != null)
                {
                    return string.Join(",", allowed_values);
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "disallowed_values")]
        [LocalizedDisplayName("MC_DisallowedValues")]
        public List<string> disallowed_values { get; set; }

        [LocalizedDisplayName("MC_DisAllowedValuesName")]
        public string DisAllowedValuesName
        {
            get
            {
                if (disallowed_values != null)
                {
                    return string.Join(",", disallowed_values);
                }
                return string.Empty;
            }
        }

        public List<ElementsViewModel> Domains { get; set; }

        public string DomainUri { get; set; }
    }

    [Serializable]
    public class FilterDtoViewModel
    {
        [LocalizedDisplayName("MC_FieldId")]
        public string FieldId { get; set; }

        public string FieldName { get; set; }

        [LocalizedDisplayName("MC_AllowedValues")]
        public List<string> AllowedValues { get; set; }

        [LocalizedDisplayName("MC_AllowedValuesName")]
        public string AllowedValuesName
        {
            get
            {
                if (AllowedValues != null)
                {
                    return string.Join(",", AllowedValues);
                }
                return string.Empty;
            }
        }

        [LocalizedDisplayName("MC_DisallowedValues")]
        public List<string> DisAllowedValues { get; set; }

        [LocalizedDisplayName("MC_DisAllowedValuesName")]
        public string DisAllowedValuesName
        {
            get
            {
                if (DisAllowedValues != null)
                {
                    return string.Join(",", DisAllowedValues);
                }
                return string.Empty;
            }
        }

        [LocalizedDisplayName("MC_IsReferenceFilter")]
        public bool IsReferenceFilter { get; set; }

        [LocalizedDisplayName("MC_ClassId")]
        public string ClassId { get; set; }

        [LocalizedDisplayName("MC_ClassName")]
        public string ClassName { get; set; }

        [LocalizedDisplayName("MC_AllowedAllNull")]
        public bool? AllowedAllNull { get; set; }

        [LocalizedDisplayName("MC_TargetClassId")]
        public string TargetClassId { get; set; }

        [LocalizedDisplayName("MC_TargetClassName")]
        public string TargetClassName { get; set; }

        [LocalizedDisplayName("MC_Index")]
        public string Index
        {
            get
            {
                return Guid.NewGuid().ToString();
            }
        }

        public List<ElementsViewModel> Domains { get; set; }

        public string DomainUri { get; set; }
    }
}
