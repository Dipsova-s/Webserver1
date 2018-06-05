using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.BusinessLogic.Rows;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Service.ODataControllers;
using RestSharp.Extensions.MonoHttp;
using System.Collections.Specialized;
using System.Web.Http;
using System.Web.Http.OData;

namespace EveryAngle.OData.ODataControllers
{
    public class RowsController : BaseODataController
    {
        private readonly IRowsEdmBusinessLogic _rowsEdmBusinessLogic;

        public RowsController(
            IRowsEdmBusinessLogic rowsEdmBusinessLogic)
        {
            _rowsEdmBusinessLogic = rowsEdmBusinessLogic;
        }

        public EdmEntityObjectCollection Get()
        {
            NameValueCollection valueCollection = HttpUtility.ParseQueryString(ControllerContext.Request.RequestUri.Query);

            // retrieve the display from the ControllerDescriptor
            Display display = (Display)ControllerContext.ControllerDescriptor.Properties["display"];

            return _rowsEdmBusinessLogic.GetRowsEntityCollection(Context, Request, valueCollection, display);
        }
    }
}