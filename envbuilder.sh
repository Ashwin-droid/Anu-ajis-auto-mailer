touch .env
echo API_KEY=${{ secrets.API_KEY }} >> .env
echo CLIENT_ID=${{ secrets.CLIENT_ID }} >> .env
echo CLIENT_SECRET=${{ secrets.CLIENT_SECRET }} >> .env
echo EMAIL=${{ secrets.EMAIL }} >> .env
echo REFRESH_TOKEN=${{ secrets.REFRESH_TOKEN }} >> .env
echo TARGET_MAIL_ID=${{ secrets.TARGET_MAIL_ID }} >> .env
echo WRITE_ACC=${{ secrets.WRITE_ACC }} >> .env