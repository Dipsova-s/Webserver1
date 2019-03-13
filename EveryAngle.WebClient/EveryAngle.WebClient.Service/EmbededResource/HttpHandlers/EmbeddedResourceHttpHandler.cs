using EveryAngle.Shared.Helpers;
using System.IO;
using System.Reflection;
using System.Web;
using System.Web.Routing;

namespace EveryAngle.WebClient.Service.EmbededResource.HttpHandlers
{
    public class EmbeddedResourceHttpHandler : IHttpHandler
    {
        private RouteData _routeData;
        public EmbeddedResourceHttpHandler(RouteData routeData)
        {
            _routeData = routeData;
        }
        public bool IsReusable
        {
            get { return false; }
        }
        public void ProcessRequest(HttpContext context)
        {
            var routeDataValues = _routeData.Values;
            var fileName = routeDataValues["file"].ToString();
            var fileExtension = routeDataValues["extension"].ToString();

            var resources = Assembly.Load("EveryAngle.Shared.EmbeddedViews");
            string nameSpace = resources.GetName().Name;
            string folderName = string.Empty;
            Stream stream = null;
            string embededFilePath = string.Empty;
            if (fileExtension.ToLower() == "js" || fileExtension.ToLower() == "css")
            {
                if (fileName.Contains("businessprocesses"))
                {
                    folderName = "Resource.BusinessProcess";
                }
                else if (fileName.Contains("fieldschooser"))
                {
                    folderName = "Resource.FieldsChooser";
                }
                else if (fileName.Contains("classeschooser"))
                {
                    folderName = "Resource.ClassesChooser";
                }
                else if (fileName.Contains("notificationsfeed"))
                {
                    folderName = "Resource.NotificationsFeed";
                }
                else {
                    folderName = "Resource.Shared";
                }

                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }
            else
            {
                //images
                folderName = "Resource.BusinessProcess";
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);

                if (stream == null)
                {
                    folderName = "Resource.FieldsChooser";
                    embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                    stream = resources.GetManifestResourceStream(embededFilePath);
                }

                if (stream == null)
                {
                    folderName = "Resource.ClassesChooser";
                    embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                    stream = resources.GetManifestResourceStream(embededFilePath);
                }

                if (stream == null)
                {
                    folderName = "Resource.NotificationsFeed";
                    embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                    stream = resources.GetManifestResourceStream(embededFilePath);
                }

                if (stream == null)
                {
                    folderName = "Resource.Shared";
                    embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, folderName, fileName, fileExtension);
                    stream = resources.GetManifestResourceStream(embededFilePath);
                }
            }



            context.Response.Clear();

            MimeTypeUtilities memTypeUtilities = new MimeTypeUtilities();
            context.Response.ContentType = memTypeUtilities.GetMimeType(embededFilePath);// default

            stream.CopyTo(context.Response.OutputStream);
        }
    }
}
