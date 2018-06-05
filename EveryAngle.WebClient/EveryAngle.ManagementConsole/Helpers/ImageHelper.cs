using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class ImageHelper
    {
        #region private variables

        private static readonly string _extension = ".png";

        #endregion

        #region public functions

        public static void RenameFile(string oldFileName, string newFileName, int fileSize, string itemUploadFolderPath)
        {
            string extension = ".png";
            string oldFinalFileName = oldFileName + "_" + fileSize + extension;
            string newFinalFIleName = newFileName + "_" + fileSize + extension;
            if (File.Exists(HttpContext.Current.Request.MapPath(itemUploadFolderPath + oldFinalFileName)))
            {
                try
                {
                    File.Move(HttpContext.Current.Request.MapPath(itemUploadFolderPath + oldFinalFileName),
                              HttpContext.Current.Request.MapPath(itemUploadFolderPath + newFinalFIleName));
                }
                catch (IOException) { }
            }
        }

        public static bool RenameUploadFile(HttpPostedFileBase file, string finalFileName, string itemUploadFolderPath, int fileSize)
        {
            // file doesn't exist, upload item but validate first
            TryDeleteExistingFile(HttpContext.Current.Request.MapPath(itemUploadFolderPath + finalFileName + _extension));
            return UploadFile(file, finalFileName, itemUploadFolderPath, fileSize, false);
        }

        public static bool RenameUploadLogo(HttpPostedFileBase file, string finalFileName, string itemUploadFolderPath)
        {
            // file doesn't exist, upload item but validate first
            TryDeleteExistingFile(HttpContext.Current.Request.MapPath(itemUploadFolderPath + finalFileName));
            return UploadFile(file, finalFileName, itemUploadFolderPath, 600, true);
        }

        public static Image ScaleBySize(Image imgPhoto, int size, bool isLogo)
        {
            float sourceWidth = imgPhoto.Width;
            float sourceHeight = imgPhoto.Height;
            float destHeight = 0;
            float destWidth = 0;

            int sourceX = 0;
            int sourceY = 0;
            int destX = 0;
            int destY = 0;
            int logoSize = size;

            // Resize Image to have the height = logoSize/2 or width = logoSize.
            // Height is greater than width, set Height = logoSize and resize width accordingly
            if (isLogo)
            {
                if (sourceWidth > 2 * sourceHeight)
                {
                    destWidth = logoSize;
                    destHeight = sourceHeight * logoSize / sourceWidth;
                }
                else
                {
                    float height = logoSize / 2;
                    destHeight = height;
                    destWidth = sourceWidth * height / sourceHeight;
                }
            }
            else
            {
                destHeight = size;
                destWidth = size;
            }

            // Width is greater than height, set Width = logoSize and resize height accordingly
            Bitmap bmPhoto = new Bitmap((int)destWidth, (int)destHeight, PixelFormat.Format32bppPArgb);
            bmPhoto.SetResolution(imgPhoto.HorizontalResolution, imgPhoto.VerticalResolution);

            Graphics grPhoto = Graphics.FromImage(bmPhoto);
            grPhoto.InterpolationMode = InterpolationMode.HighQualityBicubic;
            grPhoto.DrawImage(imgPhoto,
                new Rectangle(destX, destY, (int)destWidth, (int)destHeight),
                new Rectangle(sourceX, sourceY, (int)sourceWidth, (int)sourceHeight),
                GraphicsUnit.Pixel);

            grPhoto.Dispose();

            return bmPhoto;
        }

        public static bool ValidateExtension(string extension)
        {
            switch (extension.ToLower())
            {
                case ".jpg":
                    return true;
                case ".png":
                    return true;
                case ".gif":
                    return true;
                case ".jpeg":
                    return true;
                default:
                    return false;
            }
        }

        #endregion

        #region private functions

        private static void TryDeleteExistingFile(string filePath)
        {
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch (IOException) { }
            }
        }

        private static bool UploadFile(HttpPostedFileBase file, string fileName, string itemUploadFolderPath, int fileSise, bool isLogo)
        {
            // make sure the file is valid
            if (!ValidateExtension(_extension))
            {
                // due the _extension object is hard-coded as '.png', so, this condition is 'absolutely' unreachable, do we need to checkit?
                return false;
            }

            try
            {
                string path = Path.Combine(HttpContext.Current.Request.MapPath(itemUploadFolderPath), fileName) + _extension;

                file.SaveAs(path);

                //pass in whatever value you want for the width (180)
                Image imgOriginal = Image.FromFile(path);
                Image imgActual = ScaleBySize(imgOriginal, fileSise, isLogo);
                imgOriginal.Dispose();
                imgActual.Save(path);
                imgActual.Dispose();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        #endregion
    }
}
