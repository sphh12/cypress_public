FROM cypress/browsers:node-24.11.1-chrome-142.0.7444.175-1-ff-145.0.1-edge-142.0.3595.90-1

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    xdotool \
    xvfb \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# package.json 복사 및 의존성 설치
COPY package.json yarn.lock ./
RUN yarn install

# 프로젝트 파일 복사
COPY . .

# 기본 명령어
CMD ["sh", "./shell/run-test.sh"]