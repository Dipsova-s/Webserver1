using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Resources;
using Newtonsoft.Json;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.Core.ViewModels
{
    public static class JsonResourceHandler
    {
        public static string GetResource<T>(string jsonPropertyName)
        {
            string localizedName = jsonPropertyName;
            Type objectType = typeof(T);
            PropertyInfo[] allProperties = objectType.GetProperties();

            foreach (PropertyInfo propertyInfo in allProperties)
            {
                var jsonPropertyAttr = propertyInfo.GetCustomAttribute(typeof(JsonPropertyAttribute), true);
                var jsonPropertyAttrObject = jsonPropertyAttr as JsonPropertyAttribute;
                if ((jsonPropertyAttrObject != null && jsonPropertyAttrObject.PropertyName == jsonPropertyName) || propertyInfo.Name == jsonPropertyName)
                {
                    var localizedAttr = propertyInfo.GetCustomAttribute(typeof(LocalizedDisplayNameAttribute), true);
                    if (localizedAttr != null)
                    {
                        var localizedAttrObject = localizedAttr as LocalizedDisplayNameAttribute;
                        localizedName = localizedAttrObject.DisplayName;
                        return localizedName;
                    }
                }

                //dependency class
                if (propertyInfo.PropertyType == typeof(SystemPrivilegeViewModel))
                {
                    localizedName = GetResource<SystemPrivilegeViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(ModelPrivilegeViewModel))
                {
                    localizedName = GetResource<ModelPrivilegeViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(PrivilegesForModelViewModel))
                {
                    localizedName = GetResource<PrivilegesForModelViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(ModelServerAuthorizationViewModel))
                {
                    localizedName = GetResource<ModelServerAuthorizationViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(List<ObjectFilterViewModel>))
                {
                    localizedName = GetResource<ObjectFilterViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(List<FieldAuthorizationViewModel>))
                {
                    localizedName = GetResource<FieldAuthorizationViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(List<FieldFilterViewModel>))
                {
                    localizedName = GetResource<FieldFilterViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(List<FilterDtoViewModel>))
                {
                    localizedName = GetResource<FilterDtoViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
                else if (propertyInfo.PropertyType == typeof(List<ReferenceFilterViewModel>))
                {
                    localizedName = GetResource<ReferenceFilterViewModel>(jsonPropertyName);
                    if (localizedName != jsonPropertyName)
                        return localizedName;
                }
            }

            return localizedName;
        }
    }
}
