# VPC
resource "aws_vpc" "moviemate_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "moviemate_vpc"
  }
}

# Subnets
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.moviemate_vpc.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "public_subnet_a"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.moviemate_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "public_subnet_b"
  }
}

resource "aws_subnet" "public_subnet_c" {
  vpc_id                  = aws_vpc.moviemate_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1c"
  map_public_ip_on_launch = true
  tags = {
    Name = "public_subnet_c"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "moviemate_igw" {
  vpc_id = aws_vpc.moviemate_vpc.id
  tags = {
    Name = "moviemate_igw"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.moviemate_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.moviemate_igw.id
  }

  tags = {
    Name = "public_route_table"
  }
}

# Associate Subnets with Route Table
resource "aws_route_table_association" "public_subnet_a_association" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_b_association" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_c_association" {
  subnet_id      = aws_subnet.public_subnet_c.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "moviemate_security_group" {
  name        = "moviemate_security_group"
  description = "Allow specific traffic"
  vpc_id      = aws_vpc.moviemate_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp" # Allow HTTP traffic
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp" # Allow HTTPS traffic
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp" # Allow all TCP traffic from within the same security group
    self        = true
  }

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "udp" # Allow all UDP traffic from within the same security group
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "ALL" # Allow all outbound traffic
    cidr_blocks = ["0.0.0.0/0"]
  }
}



# NAT Gateway
#
# resource "aws_eip" "nat_eip" {
#   vpc = true
# }
#
# resource "aws_nat_gateway" "nat_gateway" {
#   allocation_id = aws_eip.nat_eip.id
#   subnet_id     = aws_subnet.public_subnet_a.id
#   depends_on     = [aws_internet_gateway.moviemate_igw]
# }
