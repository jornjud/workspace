#!/bin/bash
# Maopay Deployment Script

echo "🚀 Maopay Deployment"
echo "===================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Deploy functions
deploy_functions() {
    echo -e "${YELLOW}Deploying Firebase Functions...${NC}"
    cd functions
    npm install
    firebase deploy --only functions
    cd ..
}

# Build customer app
build_customer() {
    echo -e "${YELLOW}Building Customer App...${NC}"
    cd customer-app
    npx expo export
    cd ..
}

# Build driver app
build_driver() {
    echo -e "${YELLOW}Building Driver App...${NC}"
    cd driver-app
    npx expo export
    cd ..
}

# Build merchant app
build_merchant() {
    echo -e "${YELLOW}Building Merchant App...${NC}"
    cd merchant-app
    npx expo export
    cd ..
}

# Deploy admin web
deploy_admin() {
    echo -e "${YELLOW}Deploying Admin Web...${NC}"
    cd admin-web
    npm run build
    npx vercel deploy --prod
    cd ..
}

# Main menu
echo "Select deployment:"
echo "1. Deploy all"
echo "2. Deploy functions only"
echo "3. Build apps (EAS Build)"
echo "4. Deploy admin web"
echo "5. Exit"

read -p "Choice: " choice

case $choice in
    1)
        deploy_functions
        build_customer
        build_driver
        build_merchant
        deploy_admin
        ;;
    2) deploy_functions ;;
    3) 
        build_customer
        build_driver
        build_merchant
        ;;
    4) deploy_admin ;;
    *) exit ;;
esac

echo -e "${GREEN}Deployment complete!${NC}"
