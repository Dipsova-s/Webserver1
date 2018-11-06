using System;
using System.Collections;
using System.Reflection;
using System.Web.Caching;
using System.Web.Hosting;

namespace EveryAngle.WebClient.Service.EmbededResource
{
    public class EmbeddedVirtualPathProvider : VirtualPathProvider
    {
        private readonly VirtualPathProvider _previous;
        public EmbeddedVirtualPathProvider(VirtualPathProvider previous)
        {
            _previous = previous;
        }
        public override bool FileExists(string virtualPath)
        {
            if (IsEmbeddedPath(virtualPath))
                return true;
            else
                return _previous.FileExists(virtualPath);
        }
        public override CacheDependency GetCacheDependency(string virtualPath, IEnumerable virtualPathDependencies, DateTime utcStart)
       { 
            if (IsEmbeddedPath(virtualPath))
            {
                return null;
            }
            else
            {
                return _previous.GetCacheDependency(virtualPath, virtualPathDependencies, utcStart);
            }
        }
        public override VirtualDirectory GetDirectory(string virtualDir)
        {
            return _previous.GetDirectory(virtualDir);
        }
        public override bool DirectoryExists(string virtualDir)
        {
            return _previous.DirectoryExists(virtualDir);
        }
        public override VirtualFile GetFile(string virtualPath)
        {
            if (IsEmbeddedPath(virtualPath))
            {
                string fileNameWithExtension = virtualPath.Substring(virtualPath.LastIndexOf("/") + 1);

                var resources = Assembly.Load("EveryAngle.Shared.EmbeddedViews");
                string nameSpace = resources.GetName().Name;
                string folderName;

                if (fileNameWithExtension.Contains("businessprocesses"))
                {
                    folderName = "Resource.BusinessProcess";
                }
                else if (fileNameWithExtension.Contains("fieldschooser"))
                {
                    folderName = "Resource.FieldsChooser";
                }
                else if (fileNameWithExtension.Contains("classeschooser"))
                {
                    folderName = "Resource.ClassesChooser";
                }
                else
                {
                    folderName = "Resource.Shared";
                }


                string manifestResourceName = string.Format("{0}.{1}.{2}", nameSpace, folderName, fileNameWithExtension);

                var stream = resources.GetManifestResourceStream(manifestResourceName);
                return new EmbeddedVirtualFile(virtualPath, stream);
            }
            else
                return _previous.GetFile(virtualPath);
        }
        private bool IsEmbeddedPath(string path)
        {
            return path.Contains("~/resources/embedded") ;
        }
    }
}
