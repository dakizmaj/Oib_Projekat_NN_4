USERVICE_PATH='./back/microservices'
RUN_MODE='dev' # default run mode

run_frontend() {
    npm --prefix ./front/ run RUN_MODE
}

run_gateway() {
    npm --prefix ./back/gateway-api/ run RUN_MODE
}

run_uservice_user() {
    npm --prefix "$USERVICE_PATH/user-microservice/" run RUN_MODE
}

run_uservice_auth() {
    npm --prefix "$USERVICE_PATH/auth-microservice/" run RUN_MODE
}

run_uservice_log() {
    npm --prefix "$USERVICE_PATH/logging-microservice/" run RUN_MODE
}



run_all() {
    run_frontend & \
    run_gateway & \
    run_uservice_user & \
    run_uservice_auth & \
    run_uservice_log
}

run_all