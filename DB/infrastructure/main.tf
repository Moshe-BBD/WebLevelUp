terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.40.0"
    }
  }

  required_version = ">= 1.7.4"

  backend "s3" {
    bucket = "spider-level-up-terraform-aws"
    key = "infrastructure/state-files"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.AWS_REGION
}

resource "aws_vpc" "spiderpedia_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "spiderpedia_vpc"
  }
}

resource "aws_internet_gateway" "spiderpedia_gateway" {
  vpc_id = aws_vpc.spiderpedia_vpc.id
  tags = {
    owner = "samuel.finder@bbd.co.za"
  }
}

resource "aws_subnet" "spiderpedia_subnet_a" {
  vpc_id                  = aws_vpc.spiderpedia_vpc.id
  cidr_block              = "10.0.4.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-west-1a"
  tags = {
    owner: "samuel.finder@bbd.co.za"
  }
}

resource "aws_route_table" "spiderpedia_route_table_a" {
  vpc_id = aws_vpc.spiderpedia_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.spiderpedia_gateway.id
  }

  tags = {
    owner = "samuel.finder@bbd.co.za"
  }
}

resource "aws_route_table_association" "spiderpedia_association_a" {
  subnet_id      = aws_subnet.spiderpedia_subnet_a.id
  route_table_id = aws_route_table.spiderpedia_route_table_a.id
}

resource "aws_subnet" "spiderpedia_subnet_b" {
  vpc_id                  = aws_vpc.spiderpedia_vpc.id
  cidr_block              = "10.0.5.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-west-1b"
  tags = {
    owner = "samuel.finder@bbd.co.za"
  }
}

resource "aws_route_table" "spiderpedia_route_table_b" {
    vpc_id = aws_vpc.spiderpedia_vpc.id


  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.spiderpedia_gateway.id
  }

  tags = {
    owner = "samuel.finder@bbd.co.za"
  }
}

resource "aws_route_table_association" "spiderpedia_association_b" {
  subnet_id      = aws_subnet.spiderpedia_subnet_b.id
  route_table_id = aws_route_table.spiderpedia_route_table_b.id
}

resource "aws_db_subnet_group" "spiderpedia_subnet_group" {
  name       = "spiderpedia_subnet_group"
  subnet_ids = [aws_subnet.spiderpedia_subnet_a.id, aws_subnet.spiderpedia_subnet_b.id]

  tags = {
    owner: "samuel.finder@bbd.co.za"
  }
}

resource "aws_security_group" "spiderpedia_security_group" {
  vpc_id = aws_vpc.spiderpedia_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    owner: "samuel.finder@bbd.co.za"
  }
}

resource "aws_db_instance" "beantastic_postgres_rds" {
  allocated_storage    = 5
  instance_class       = "db.t3.micro"
  publicly_accessible  = true
  skip_final_snapshot  = true
  multi_az             = false
  engine               = "postgres"
  identifier           = "spiderpedia-postgres-db"
  db_name              = "SpiderpediaDB"
  username             = var.DB_USERNAME
  password             = var.DB_PASSWORD

  vpc_security_group_ids = [aws_security_group.spiderpedia_security_group.id]
  db_subnet_group_name = aws_db_subnet_group.spiderpedia_subnet_group.name


  tags = {
    owner = "samuel.finder@bbd.co.za"
  }
}