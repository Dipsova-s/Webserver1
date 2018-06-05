using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Comment;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Shared.Helpers;

using Kendo.Mvc.UI;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Core.ViewModels.Directory;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class CommentController : BaseController
    {
        #region private variables

        private readonly ICommentService _commentService;

        #endregion

        #region constructors

        public CommentController(
            ICommentService commentService,
            SessionHelper sessionHelper)
        {
            _commentService = commentService;
            SessionHelper = sessionHelper;
        }

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        #endregion

        #region routes

        public ActionResult GetCommentsByType(string commentType)
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.CommentType = commentType;
            ViewBag.CurrentUserUri = SessionHelper.CurrentUser.Uri;
            return PartialView("~/Views/Shared/Comment.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult AddComment(FormCollection formCollection, HttpPostedFileBase file, string commentType)
        {
            CommentViewModel comment = new CommentViewModel();
            string commentUri = formCollection["commentUri"];
            
            if (!string.IsNullOrEmpty(commentUri) && !string.IsNullOrWhiteSpace(commentUri))
            {
                comment.comment = formCollection["message"];
                _commentService.UpdateComment(commentUri, new JavaScriptSerializer().Serialize(comment));
            }
            else
            {
                VersionViewModel version = SessionHelper.Version;
                if (file != null && file.ContentLength > 0)
                {
                    string fileName = Path.GetFileName(file.FileName);
                    string[] splitFileName = fileName.Split('.');
                    string newGuid = Guid.NewGuid().ToString();
                    comment.attachment = newGuid + "." + splitFileName.Last().ToLower();

                    AttachFileHelper.RenameUploadFile(file, newGuid);
                }
                else
                {
                    comment.attachment = "Null";
                }

                comment.comment_type = formCollection["commentType"];
                comment.comment = formCollection["message"];
                CommentViewModel commented = _commentService.AddComment(
                                                version.GetEntryByName("comments").Uri.ToString(),
                                                new JavaScriptSerializer().Serialize(comment));
            }
            return JsonHelper.GetJsonStringResult(
                                true, null, null, MessageType.DEFAULT,
                                new { commentType = formCollection["commentType"] });
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadComment([DataSourceRequest] DataSourceRequest request, string commentType)
        {
            var date = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var comments = GetComments(commentType, 1, MaxPageSize);
            var result = new DataSourceResult
            {
                Data =
                    comments.Data.OrderByDescending(
                        comment => date.AddMilliseconds(comment.CreatedBy.Created).ToLocalTime()).ToList(),
                Total = comments.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteComment(string commentUri)
        {
            _commentService.DeleteComment(commentUri);
        }

        #endregion

        #region private methods

        private ListViewModel<CommentViewModel> GetComments(string commentType, int page, int DefaultPageSize)
        {
            var uri = GenerateUri(commentType, 1, MaxPageSize);
            var comments = _commentService.GetCommentsByType(uri);
            return comments;
        }

        private string GenerateUri(string commentType, int page, int pageSize)
        {
            var version = SessionHelper.Version;
            var uri = version.GetEntryByName("comments").Uri + "?comment_type=" + commentType + "&" +
                      UtilitiesHelper.GetOffsetLimitQueryString(page, pageSize);
            return uri;
        }

        #endregion
    }

    #region TODO: this class need to move it out to a lower layer

    // need to move this class to lower layer to make it testable.
    public class AttachFileHelper
    {
        private static string[] validExtensions = new string[]
        {
            ".eapackage", ".csl", ".zip",
            ".xls", ".xlsx", ".doc", ".docx", ".pdf",
            ".bmp", ".gif", ".jpg", ".jpeg", ".png",
            ".htm", ".html", ".txt"
        };

        public static readonly string ItemUploadFolderPath = "~/UploadedResources/Comments/";

        public static bool RenameUploadFile(HttpPostedFileBase file, string renamedFile)
        {
            if (File.Exists(HttpContext.Current.Request.MapPath(ItemUploadFolderPath + renamedFile)))
            {
                try
                {
                    File.Delete(HttpContext.Current.Request.MapPath(ItemUploadFolderPath + renamedFile));
                }
                catch (IOException)
                {
                }
            }
            return UploadFile(file, renamedFile);
        }

        private static bool UploadFile(HttpPostedFileBase file, string fileName)
        {
            var name = Path.GetFileName(file.FileName);
            var splitFileName = name.Split('.');
            var extension = "." + splitFileName.Last();
            var path = Path.Combine(HttpContext.Current.Request.MapPath(ItemUploadFolderPath), fileName);

            path = path + extension;
            if (!ValidateExtension(extension))
            {
                return false;
            }

            try
            {
                file.SaveAs(path);
                var imgOriginal = Image.FromFile(path);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private static bool ValidateExtension(string extension)
        {
            return validExtensions.Contains(extension.ToLower());
        }
    }

    #endregion
}
