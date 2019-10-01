using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using Microsoft.Data.Edm;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net.Http;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;

namespace EveryAngle.OData.BusinessLogic.Interfaces
{
    public interface IRowsEdmBusinessLogic
    {
        void CreateNextPageLink(HttpRequestMessage request, NameValueCollection nameValues, string resultId, int? nextLinkSkip, out string next);
        EdmEntityObjectCollection GetEdmEntityObjectCollection(IEdmCollectionTypeReference edmType, IList<IEdmEntityObject> list);
        EdmEntityObjectCollection GetRowsEntityCollection(IContext context, HttpRequestMessage request, NameValueCollection nameValueCollection, Display display);
        IEdmCollectionType GetEdmCollectionType(HttpRequestMessageProperties properties);
        IEdmCollectionTypeReference GetEdmCollectionTypeReference(IEdmCollectionType collectionType, bool isNullable);
        IList<IEdmEntityObject> ReadData(IContext context, IEdmEntityType type, Display display, SkipQueryOption skipQueryOption, TopQueryOption topQueryOption, ref string resultId, out int totalCount, out int? nextLinkSkip);
        IList<IEdmEntityObject> InitializeEdmEntityCollection(IEdmEntityType type, IList<IEdmEntityObject> list, DataRows data, IList<FieldMap> fieldMap);
        IEnumerable<IEdmStructuralProperty> GetEdmStructuralProperty(IEdmEntityType type);
        IList<FieldMap> GetFieldMap(IEdmEntityType type, DataRows data);
        object ConvertValue(object value, FieldMap fieldMap);
        QueryResult DetermineGetResult(IContext context, Display display, SkipQueryOption skipQueryOption, string resultId);
    }
}
