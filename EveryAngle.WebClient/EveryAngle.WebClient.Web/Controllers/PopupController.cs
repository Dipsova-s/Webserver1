using EveryAngle.Core.ViewModels.Angle;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.Mvc;
using System.Text.RegularExpressions;

namespace EveryAngle.WebClient.Web.Controllers
{

    public class PopupController : BaseController
    {
        [OutputCache(Duration = 0, NoStore = false)]
        public ActionResult Get(string id)
        {
            string view = String.Empty;

            switch (id.ToLower())
            {
                case "loginpopup":
                    view = @"~/Views/User/PartialViews/UserLoginBodyPage.cshtml";
                    break;
            }

            if (view == string.Empty)
            {
                return Content("Popup: " + id + " does not exists.");
            }
            else
            {
                return PartialView(view);
            }
        }
    }


}
