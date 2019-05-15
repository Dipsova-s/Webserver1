using EveryAngle.Logging;
using EveryAngle.WebClient.Service.LogHandlers;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace EveryAngle.WebClient.Service
{
    public class UpdatedPropertiesResolver<T> : DefaultContractResolver
    {
        private readonly T updatedObject;
        private readonly T defaultObject;
        private readonly Dictionary<string, string> ObjectContracts = new Dictionary<string, string>();

        public UpdatedPropertiesResolver(T updatedObject, T defaultObject)
        {
            this.updatedObject = updatedObject;
            this.defaultObject = defaultObject;
        }

        //3
        protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization)
        {
            IList<JsonProperty> properties = base.CreateProperties(type, memberSerialization);
            IList<JsonProperty> updatedProperties = new List<JsonProperty>();

            foreach (JsonProperty property in properties)
            {
                if (property.UnderlyingName != "model")
                {
                    if (HasChanged(property.UnderlyingName, type))
                    {
                        updatedProperties.Add(property);
                    }
                }
                else
                {
                    updatedProperties.Add(property);
                }
            }

            return updatedProperties.Any() ? updatedProperties : null;
        }

        //1
        protected override JsonObjectContract CreateObjectContract(Type objectType)
        {
            JsonObjectContract contract = base.CreateObjectContract(objectType);
            foreach (JsonProperty property in contract.Properties)
            {
                if (!ObjectContracts.ContainsKey(property.PropertyName))
                {
                    ObjectContracts.Add(property.UnderlyingName, property.PropertyType.FullName);
                }
            }
            return contract;
        }

        protected override JsonArrayContract CreateArrayContract(Type objectType)
        {
            return base.CreateArrayContract(objectType);
        }

        protected override JsonContract CreateContract(Type objectType)
        {
            return base.CreateContract(objectType);
        }

        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            return base.CreateProperty(member, memberSerialization);
        }

        static bool GetValue(object currentObject, string propName, out object value)
        {
            // call helper function that keeps track of which objects we've seen before
            return GetValue(currentObject, propName, out value, new HashSet<object>());
        }

        static bool GetValue(object currentObject, string propName, out object value,
                             HashSet<object> searchedObjects)
        {
            PropertyInfo propInfo = currentObject.GetType().GetProperty(propName);
            if (propInfo != null)
            {
                value = propInfo.GetValue(currentObject, null);
                return true;
            }
            // search child properties
            foreach (PropertyInfo propInfo2 in currentObject.GetType().GetProperties())
            {   // ignore indexed properties
                if (propInfo2.GetIndexParameters().Length == 0)
                {
                    object newObject = propInfo2.GetValue(currentObject, null);
                    if (newObject != null && searchedObjects.Add(newObject) &&
                        GetValue(newObject, propName, out value, searchedObjects))
                        return true;
                }
            }
            // property not found here
            value = null;
            return false;
        }

        private object FindMember(object obj, Type expectedType)
        {
            object member = null;
            var contract = ObjectContracts.FirstOrDefault(filter => filter.Value == expectedType.FullName);
            if (!contract.Equals(default(KeyValuePair<string, string>)))
            {
                GetValue(obj, contract.Key, out member);
            }
            return member;
        }

        public bool HasChanged(string propertyName, Type type)
        {
            bool isChanged = false;
            object updatedValue = null;
            object defaultValue = null;

            if (type == updatedObject.GetType())
            {
                updatedValue = updatedObject.GetType().GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(updatedObject);
                defaultValue = defaultObject.GetType().GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(defaultObject);
            }
            else
            {
                //find property from properties
                object updatedMember = FindMember(updatedObject, type);
                object defaultMember = FindMember(defaultObject, type);

                if (updatedMember != null && defaultMember != null)
                {
                    updatedValue = updatedMember.GetType().GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(updatedMember);
                    defaultValue = defaultMember.GetType().GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance).GetValue(defaultMember);
                }
            }

            if (!Equals(updatedValue, defaultValue) && updatedValue != null)
            {
                if (updatedValue.GetType() == typeof(List<string>))
                {
                    isChanged = !(updatedValue as List<string>).SequenceEqual(defaultValue as List<string>);
                }
                else if (updatedValue is DateTime)
                {
                    isChanged = ((DateTime)updatedValue).CompareTo(((DateTime)defaultValue)) != 0;
                }
                else if (updatedValue is int)
                {
                    isChanged = ((int)updatedValue).CompareTo(((int)defaultValue)) != 0;
                }
                else if (updatedValue is string)
                {
                    isChanged = ((string)updatedValue).CompareTo(((string)defaultValue)) != 0;
                }
                else if (updatedValue is bool)
                {
                    isChanged = !Equals(updatedValue, defaultValue);
                }
                else
                {
                    isChanged = true;
                }
            }

            return isChanged;
        }
    }

    public class CleanUpPropertiesResolver : DefaultContractResolver
    {
        private readonly List<string> exceptFields;
        
        public CleanUpPropertiesResolver(List<string> exceptFields)
        {
            this.exceptFields = exceptFields;
        }

        //3
        protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization)
        {
            IList<JsonProperty> properties = base.CreateProperties(type, memberSerialization);
            IList<JsonProperty> updatedProperties = new List<JsonProperty>();

            foreach (JsonProperty property in properties)
            {
                if (IsValidToAdd(property))
                {
                    updatedProperties.Add(property);
                }
            }

            return updatedProperties.Any() ? updatedProperties : null;
        }

        private bool IsValidToAdd(JsonProperty property)
        {
            if (exceptFields == null || exceptFields.Count == 0)
            {
                if (property.PropertyType == typeof(Uri))
                {
                    if (property.UnderlyingName == "model")
                    {
                        return true;
                    }
                    else return false;
                }
                else if (property.UnderlyingName == "CreatedBy")
                {
                    return false;
                }
                else return true;
            }
            else
            {
                if (property.PropertyType == typeof(Uri))
                {
                    if (property.UnderlyingName == "model")
                    {
                        return true;
                    }
                    else return false;
                }
                else if (property.UnderlyingName == "CreatedBy")
                {
                    return false;
                }
                else
                {
                    return !exceptFields.Contains(property.UnderlyingName);
                }
            }

        }
    }

    public class AcceptancePropertiesResolver : DefaultContractResolver
    {
        private readonly IList<string> _acceptanceProperties;
        public AcceptancePropertiesResolver(IList<string> acceptanceProperties)
        {
            _acceptanceProperties = acceptanceProperties;
        }

        protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization)
        {
            IList<JsonProperty> jsonProperties = base.CreateProperties(type, memberSerialization);
            IList<JsonProperty> acceptanceJsonProperties = jsonProperties.Where(x => _acceptanceProperties.Contains(x.PropertyName)).ToList();

            return acceptanceJsonProperties;
        }
    }

}
