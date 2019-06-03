using EveryAngle.Shared.Helpers;
using System.IO;
using System.Reflection;
using System.Web;
using System.Web.Routing;

namespace EveryAngle.WebClient.Service.EmbededResource.HttpHandlers
{
    public class EmbeddedResourceHttpHandler : IHttpHandler
    {
        private readonly RouteData _routeData;
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
            Stream stream;
            string embededFilePath = string.Empty;
            if (fileExtension.ToLowerInvariant() == "js" || fileExtension.ToLowerInvariant() == "css")
            {
                // js or css
                string scriptFolderName = GetScriptResourceFolderName(fileName);
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, scriptFolderName, fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }
            else
            {
                //images
                TryGetImageResourceStream(fileName, fileExtension, resources, nameSpace, out stream, out embededFilePath);
            }

            context.Response.Clear();

            MimeTypeUtilities memTypeUtilities = new MimeTypeUtilities();
            context.Response.ContentType = memTypeUtilities.GetMimeType(embededFilePath);

            stream.CopyTo(context.Response.OutputStream);
        }

        private static void TryGetImageResourceStream(string fileName, string fileExtension, Assembly resources, string nameSpace, out Stream stream, out string embededFilePath)
        {
            embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, "Resource.BusinessProcess", fileName, fileExtension);
            stream = resources.GetManifestResourceStream(embededFilePath);

            if (stream == null)
            {
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, "Resource.FieldsChooser", fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }

            if (stream == null)
            {
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, "Resource.ClassesChooser", fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }

            if (stream == null)
            {
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, "Resource.NotificationsFeed", fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }

            if (stream == null)
            {
                embededFilePath = string.Format("{0}.{1}.{2}.{3}", nameSpace, "Resource.Shared", fileName, fileExtension);
                stream = resources.GetManifestResourceStream(embededFilePath);
            }
        }

        private static string GetScriptResourceFolderName(string fileName)
        {
            string folderName = string.Empty;
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
            else
            {
                folderName = "Resource.Shared";
            }

            return folderName;
        }
    }
}
